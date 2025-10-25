"""
Advanced Features API - AI, Analytics, Automation
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

from app.services.advanced_ai_service import advanced_ai_service
from app.services.predictive_analytics_service import predictive_analytics_service
from app.services.workflow_automation_service import workflow_automation_service, WORKFLOW_TEMPLATES
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/v1/advanced", tags=["advanced"])


# ============================================================================
# AI ENDPOINTS
# ============================================================================

class OpportunityAnalysisRequest(BaseModel):
    rfp_text: str
    company_profile: Dict[str, Any]

class ProposalSectionRequest(BaseModel):
    section_title: str
    requirements: List[str]
    past_performance: List[Dict]
    context: Dict[str, Any]

class ComplianceCheckRequest(BaseModel):
    proposal_text: str
    requirements: List[str]
    regulations: Optional[List[str]] = None

class FeedbackRequest(BaseModel):
    original_prompt: str
    ai_response: str
    user_correction: str
    task_type: str

@router.post("/ai/analyze-opportunity")
async def analyze_opportunity(
    request: OpportunityAnalysisRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Advanced AI analysis of opportunity fit
    """
    analysis = await advanced_ai_service.analyze_opportunity(
        rfp_text=request.rfp_text,
        company_profile=request.company_profile
    )
    
    return {
        'success': True,
        'analysis': analysis,
        'timestamp': datetime.utcnow().isoformat()
    }

@router.post("/ai/generate-proposal-section")
async def generate_proposal_section(
    request: ProposalSectionRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Generate proposal section with AI
    """
    content = await advanced_ai_service.generate_proposal_section(
        section_title=request.section_title,
        requirements=request.requirements,
        past_performance=request.past_performance,
        context=request.context
    )
    
    return {
        'success': True,
        'content': content,
        'word_count': len(content.split()),
        'timestamp': datetime.utcnow().isoformat()
    }

@router.post("/ai/check-compliance")
async def check_compliance(
    request: ComplianceCheckRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Check proposal compliance with requirements
    """
    compliance = await advanced_ai_service.check_compliance(
        proposal_text=request.proposal_text,
        requirements=request.requirements,
        regulations=request.regulations
    )
    
    return {
        'success': True,
        'compliance': compliance,
        'timestamp': datetime.utcnow().isoformat()
    }

@router.post("/ai/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Submit feedback for AI self-improvement
    """
    await advanced_ai_service.learn_from_feedback(
        original_prompt=request.original_prompt,
        ai_response=request.ai_response,
        user_correction=request.user_correction,
        task_type=request.task_type
    )
    
    return {
        'success': True,
        'message': 'Feedback recorded for model improvement',
        'timestamp': datetime.utcnow().isoformat()
    }

@router.post("/ai/win-themes")
async def generate_win_themes(
    opportunity: Dict[str, Any],
    competitors: List[Dict],
    company_strengths: List[str],
    current_user: Dict = Depends(get_current_user)
):
    """
    Generate win themes and discriminators
    """
    themes = await advanced_ai_service.generate_win_themes(
        opportunity=opportunity,
        competitors=competitors,
        company_strengths=company_strengths
    )
    
    return {
        'success': True,
        'themes': themes,
        'count': len(themes),
        'timestamp': datetime.utcnow().isoformat()
    }


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

class ForecastRequest(BaseModel):
    historical_opportunities: List[Dict]
    months_ahead: int = 6

class WinRateRequest(BaseModel):
    opportunity: Dict[str, Any]
    historical_wins: List[Dict]
    company_profile: Dict[str, Any]

class TrendAnalysisRequest(BaseModel):
    opportunities: List[Dict]
    time_period_days: int = 90

class BenchmarkRequest(BaseModel):
    company_metrics: Dict[str, Any]
    industry_averages: Optional[Dict[str, Any]] = None

@router.post("/analytics/forecast-pipeline")
async def forecast_pipeline(
    request: ForecastRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Forecast pipeline value for next N months
    """
    forecast = await predictive_analytics_service.forecast_pipeline_value(
        historical_opportunities=request.historical_opportunities,
        months_ahead=request.months_ahead
    )
    
    return {
        'success': True,
        'forecast': forecast,
        'timestamp': datetime.utcnow().isoformat()
    }

@router.post("/analytics/predict-win-rate")
async def predict_win_rate(
    request: WinRateRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Predict win probability using ML
    """
    prediction = await predictive_analytics_service.predict_win_rate(
        opportunity=request.opportunity,
        historical_wins=request.historical_wins,
        company_profile=request.company_profile
    )
    
    return {
        'success': True,
        'prediction': prediction,
        'timestamp': datetime.utcnow().isoformat()
    }

@router.post("/analytics/analyze-trends")
async def analyze_trends(
    request: TrendAnalysisRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Analyze trends in opportunities
    """
    trends = await predictive_analytics_service.analyze_trends(
        opportunities=request.opportunities,
        time_period_days=request.time_period_days
    )
    
    return {
        'success': True,
        'trends': trends,
        'timestamp': datetime.utcnow().isoformat()
    }

@router.post("/analytics/detect-anomalies")
async def detect_anomalies(
    opportunities: List[Dict],
    current_user: Dict = Depends(get_current_user)
):
    """
    Detect anomalous opportunities
    """
    anomalies = await predictive_analytics_service.detect_anomalies(
        opportunities=opportunities
    )
    
    return {
        'success': True,
        'anomalies': anomalies,
        'count': len(anomalies),
        'timestamp': datetime.utcnow().isoformat()
    }

@router.post("/analytics/benchmark")
async def benchmark_performance(
    request: BenchmarkRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Benchmark performance against industry
    """
    benchmarks = await predictive_analytics_service.benchmark_performance(
        company_metrics=request.company_metrics,
        industry_averages=request.industry_averages
    )
    
    return {
        'success': True,
        'benchmarks': benchmarks,
        'timestamp': datetime.utcnow().isoformat()
    }

@router.post("/analytics/competitive-intelligence")
async def competitive_intelligence(
    opportunity: Dict[str, Any],
    known_competitors: List[Dict],
    historical_data: List[Dict],
    current_user: Dict = Depends(get_current_user)
):
    """
    Analyze competitive landscape
    """
    intelligence = await predictive_analytics_service.competitive_intelligence(
        opportunity=opportunity,
        known_competitors=known_competitors,
        historical_data=historical_data
    )
    
    return {
        'success': True,
        'intelligence': intelligence,
        'timestamp': datetime.utcnow().isoformat()
    }


# ============================================================================
# WORKFLOW AUTOMATION ENDPOINTS
# ============================================================================

class WorkflowCreateRequest(BaseModel):
    name: str
    description: str
    trigger: Dict[str, Any]
    conditions: List[Dict[str, Any]]
    actions: List[Dict[str, Any]]
    enabled: bool = True

class WorkflowExecuteRequest(BaseModel):
    workflow_id: str
    context: Dict[str, Any]

class WorkflowEventRequest(BaseModel):
    event_type: str
    event_data: Dict[str, Any]

@router.post("/workflows/create")
async def create_workflow(
    request: WorkflowCreateRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Create a new automation workflow
    """
    workflow_id = workflow_automation_service.create_workflow(
        name=request.name,
        description=request.description,
        trigger=request.trigger,
        conditions=request.conditions,
        actions=request.actions,
        enabled=request.enabled
    )
    
    return {
        'success': True,
        'workflow_id': workflow_id,
        'message': 'Workflow created successfully'
    }

@router.get("/workflows/list")
async def list_workflows(
    enabled_only: bool = False,
    current_user: Dict = Depends(get_current_user)
):
    """
    List all workflows
    """
    workflows = workflow_automation_service.list_workflows(enabled_only=enabled_only)
    
    return {
        'success': True,
        'workflows': workflows,
        'count': len(workflows)
    }

@router.get("/workflows/{workflow_id}")
async def get_workflow(
    workflow_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Get workflow details
    """
    workflow = workflow_automation_service.get_workflow(workflow_id)
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return {
        'success': True,
        'workflow': workflow
    }

@router.post("/workflows/execute")
async def execute_workflow(
    request: WorkflowExecuteRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Manually execute a workflow
    """
    result = await workflow_automation_service.execute_workflow(
        workflow_id=request.workflow_id,
        context=request.context
    )
    
    return result

@router.post("/workflows/trigger-event")
async def trigger_event(
    request: WorkflowEventRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Trigger workflows based on event
    """
    await workflow_automation_service.trigger_event(
        event_type=request.event_type,
        event_data=request.event_data
    )
    
    return {
        'success': True,
        'message': 'Event triggered, workflows executed'
    }

@router.put("/workflows/{workflow_id}/enable")
async def enable_workflow(
    workflow_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Enable a workflow
    """
    workflow_automation_service.enable_workflow(workflow_id)
    
    return {
        'success': True,
        'message': 'Workflow enabled'
    }

@router.put("/workflows/{workflow_id}/disable")
async def disable_workflow(
    workflow_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Disable a workflow
    """
    workflow_automation_service.disable_workflow(workflow_id)
    
    return {
        'success': True,
        'message': 'Workflow disabled'
    }

@router.delete("/workflows/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Delete a workflow
    """
    workflow_automation_service.delete_workflow(workflow_id)
    
    return {
        'success': True,
        'message': 'Workflow deleted'
    }

@router.get("/workflows/{workflow_id}/history")
async def get_workflow_history(
    workflow_id: str,
    limit: int = 100,
    current_user: Dict = Depends(get_current_user)
):
    """
    Get workflow execution history
    """
    history = workflow_automation_service.get_execution_history(
        workflow_id=workflow_id,
        limit=limit
    )
    
    return {
        'success': True,
        'history': history,
        'count': len(history)
    }

@router.get("/workflows/templates")
async def get_workflow_templates(
    current_user: Dict = Depends(get_current_user)
):
    """
    Get predefined workflow templates
    """
    return {
        'success': True,
        'templates': WORKFLOW_TEMPLATES,
        'count': len(WORKFLOW_TEMPLATES)
    }

