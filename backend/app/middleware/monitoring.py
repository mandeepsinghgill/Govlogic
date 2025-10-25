"""
Production monitoring middleware
"""
import time
import logging
from fastapi import Request, Response
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import structlog

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'http_active_connections',
    'Number of active HTTP connections'
)

DATABASE_CONNECTIONS = Gauge(
    'database_connections_active',
    'Number of active database connections'
)

# Structured logging setup
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

class MonitoringMiddleware:
    """Middleware for monitoring and observability"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        request = Request(scope, receive)
        start_time = time.time()
        
        # Increment active connections
        ACTIVE_CONNECTIONS.inc()
        
        # Log request start
        logger.info(
            "request_started",
            method=request.method,
            url=str(request.url),
            user_agent=request.headers.get("user-agent"),
            client_ip=request.client.host if request.client else None
        )
        
        # Process request
        response_sent = False
        
        async def send_wrapper(message):
            nonlocal response_sent
            if not response_sent and message["type"] == "http.response.start":
                response_sent = True
                
                # Calculate metrics
                duration = time.time() - start_time
                status_code = message.get("status", 500)
                
                # Record metrics
                REQUEST_COUNT.labels(
                    method=request.method,
                    endpoint=request.url.path,
                    status_code=status_code
                ).inc()
                
                REQUEST_DURATION.labels(
                    method=request.method,
                    endpoint=request.url.path
                ).observe(duration)
                
                # Log request completion
                logger.info(
                    "request_completed",
                    method=request.method,
                    url=str(request.url),
                    status_code=status_code,
                    duration=duration
                )
            
            await send(message)
        
        try:
            await self.app(scope, receive, send_wrapper)
        except Exception as e:
            # Log errors
            logger.error(
                "request_error",
                method=request.method,
                url=str(request.url),
                error=str(e),
                duration=time.time() - start_time
            )
            raise
        finally:
            # Decrement active connections
            ACTIVE_CONNECTIONS.dec()

def get_metrics():
    """Get Prometheus metrics"""
    return generate_latest()

class SentryIntegration:
    """Sentry error tracking integration"""
    
    def __init__(self):
        self.enabled = False
    
    def init_sentry(self, dsn: str):
        """Initialize Sentry with DSN"""
        try:
            import sentry_sdk
            from sentry_sdk.integrations.fastapi import FastApiIntegration
            from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
            
            sentry_sdk.init(
                dsn=dsn,
                integrations=[
                    FastApiIntegration(auto_enabling=True),
                    SqlalchemyIntegration(),
                ],
                traces_sample_rate=0.1,
                environment="production"
            )
            self.enabled = True
            logger.info("sentry_initialized", dsn=dsn[:20] + "...")
        except ImportError:
            logger.warning("sentry_not_installed")
        except Exception as e:
            logger.error("sentry_init_failed", error=str(e))
    
    def capture_exception(self, exc_info):
        """Capture exception in Sentry"""
        if self.enabled:
            try:
                import sentry_sdk
                sentry_sdk.capture_exception(exc_info)
            except Exception as e:
                logger.error("sentry_capture_failed", error=str(e))

# Global Sentry instance
sentry = SentryIntegration()

