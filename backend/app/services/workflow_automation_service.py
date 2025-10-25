"""
Workflow Automation Service - No-code automation builder
"""
from typing import List, Dict, Any, Optional, Callable
from datetime import datetime, timedelta
from enum import Enum
import asyncio

class TriggerType(str, Enum):
    OPPORTUNITY_CREATED = "opportunity_created"
    OPPORTUNITY_QUALIFIED = "opportunity_qualified"
    DEADLINE_APPROACHING = "deadline_approaching"
    PROPOSAL_SUBMITTED = "proposal_submitted"
    SCORE_THRESHOLD = "score_threshold"
    TEAM_MEMBER_ASSIGNED = "team_member_assigned"
    COMMENT_ADDED = "comment_added"
    STATUS_CHANGED = "status_changed"
    SCHEDULE = "schedule"

class ActionType(str, Enum):
    SEND_EMAIL = "send_email"
    SEND_SLACK = "send_slack"
    CREATE_TASK = "create_task"
    ASSIGN_USER = "assign_user"
    UPDATE_STATUS = "update_status"
    GENERATE_REPORT = "generate_report"
    RUN_AI_ANALYSIS = "run_ai_analysis"
    WEBHOOK = "webhook"
    CREATE_PROPOSAL = "create_proposal"
    NOTIFY_TEAM = "notify_team"

class WorkflowAutomationService:
    """
    No-code workflow automation:
    - Trigger-based actions
    - Conditional logic
    - Multi-step workflows
    - Scheduled tasks
    - Integration with external tools
    - Custom automation rules
    """
    
    def __init__(self):
        self.workflows: Dict[str, Dict] = {}
        self.active_workflows: List[str] = []
        self.execution_history: List[Dict] = []
    
    def create_workflow(
        self,
        name: str,
        description: str,
        trigger: Dict[str, Any],
        conditions: List[Dict[str, Any]],
        actions: List[Dict[str, Any]],
        enabled: bool = True
    ) -> str:
        """
        Create a new automation workflow
        
        Example:
        {
            "name": "Auto-qualify high-scoring opportunities",
            "trigger": {
                "type": "opportunity_created",
                "filters": {}
            },
            "conditions": [
                {"field": "compliance_score", "operator": ">=", "value": 85}
            ],
            "actions": [
                {"type": "update_status", "params": {"status": "qualified"}},
                {"type": "send_email", "params": {"to": "team@company.com"}}
            ]
        }
        """
        workflow_id = f"workflow_{datetime.utcnow().timestamp()}"
        
        self.workflows[workflow_id] = {
            'id': workflow_id,
            'name': name,
            'description': description,
            'trigger': trigger,
            'conditions': conditions,
            'actions': actions,
            'enabled': enabled,
            'created_at': datetime.utcnow().isoformat(),
            'execution_count': 0,
            'last_executed': None
        }
        
        if enabled:
            self.active_workflows.append(workflow_id)
        
        return workflow_id
    
    async def execute_workflow(
        self,
        workflow_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a workflow with given context
        """
        if workflow_id not in self.workflows:
            return {'success': False, 'error': 'Workflow not found'}
        
        workflow = self.workflows[workflow_id]
        
        if not workflow['enabled']:
            return {'success': False, 'error': 'Workflow disabled'}
        
        # Check conditions
        if not self._check_conditions(workflow['conditions'], context):
            return {'success': False, 'reason': 'Conditions not met'}
        
        # Execute actions
        results = []
        for action in workflow['actions']:
            try:
                result = await self._execute_action(action, context)
                results.append(result)
            except Exception as e:
                results.append({'success': False, 'error': str(e)})
        
        # Update workflow stats
        workflow['execution_count'] += 1
        workflow['last_executed'] = datetime.utcnow().isoformat()
        
        # Log execution
        execution_record = {
            'workflow_id': workflow_id,
            'workflow_name': workflow['name'],
            'context': context,
            'results': results,
            'timestamp': datetime.utcnow().isoformat(),
            'success': all(r.get('success', False) for r in results)
        }
        
        self.execution_history.append(execution_record)
        
        return {
            'success': True,
            'workflow_id': workflow_id,
            'actions_executed': len(results),
            'results': results
        }
    
    async def trigger_event(
        self,
        event_type: str,
        event_data: Dict[str, Any]
    ):
        """
        Trigger workflows based on event
        """
        # Find matching workflows
        matching_workflows = [
            wf_id for wf_id in self.active_workflows
            if self.workflows[wf_id]['trigger']['type'] == event_type
        ]
        
        # Execute all matching workflows
        tasks = [
            self.execute_workflow(wf_id, event_data)
            for wf_id in matching_workflows
        ]
        
        if tasks:
            await asyncio.gather(*tasks)
    
    def _check_conditions(
        self,
        conditions: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> bool:
        """
        Check if all conditions are met
        """
        for condition in conditions:
            field = condition['field']
            operator = condition['operator']
            expected_value = condition['value']
            
            # Get actual value from context
            actual_value = context.get(field)
            
            # Evaluate condition
            if operator == '==':
                if actual_value != expected_value:
                    return False
            elif operator == '!=':
                if actual_value == expected_value:
                    return False
            elif operator == '>':
                if not (actual_value > expected_value):
                    return False
            elif operator == '>=':
                if not (actual_value >= expected_value):
                    return False
            elif operator == '<':
                if not (actual_value < expected_value):
                    return False
            elif operator == '<=':
                if not (actual_value <= expected_value):
                    return False
            elif operator == 'contains':
                if expected_value not in str(actual_value):
                    return False
            elif operator == 'in':
                if actual_value not in expected_value:
                    return False
        
        return True
    
    async def _execute_action(
        self,
        action: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a single action
        """
        action_type = action['type']
        params = action.get('params', {})
        
        if action_type == ActionType.SEND_EMAIL:
            return await self._send_email(params, context)
        
        elif action_type == ActionType.SEND_SLACK:
            return await self._send_slack(params, context)
        
        elif action_type == ActionType.CREATE_TASK:
            return await self._create_task(params, context)
        
        elif action_type == ActionType.ASSIGN_USER:
            return await self._assign_user(params, context)
        
        elif action_type == ActionType.UPDATE_STATUS:
            return await self._update_status(params, context)
        
        elif action_type == ActionType.GENERATE_REPORT:
            return await self._generate_report(params, context)
        
        elif action_type == ActionType.RUN_AI_ANALYSIS:
            return await self._run_ai_analysis(params, context)
        
        elif action_type == ActionType.WEBHOOK:
            return await self._call_webhook(params, context)
        
        elif action_type == ActionType.NOTIFY_TEAM:
            return await self._notify_team(params, context)
        
        else:
            return {'success': False, 'error': f'Unknown action type: {action_type}'}
    
    async def _send_email(self, params: Dict, context: Dict) -> Dict:
        """Send email notification"""
        # In production: integrate with SendGrid/AWS SES
        return {
            'success': True,
            'action': 'send_email',
            'to': params.get('to'),
            'subject': params.get('subject', '').format(**context),
            'message': 'Email would be sent in production'
        }
    
    async def _send_slack(self, params: Dict, context: Dict) -> Dict:
        """Send Slack notification"""
        # In production: integrate with Slack API
        return {
            'success': True,
            'action': 'send_slack',
            'channel': params.get('channel'),
            'message': params.get('message', '').format(**context)
        }
    
    async def _create_task(self, params: Dict, context: Dict) -> Dict:
        """Create task in system"""
        return {
            'success': True,
            'action': 'create_task',
            'task_id': f"task_{datetime.utcnow().timestamp()}",
            'title': params.get('title', '').format(**context),
            'assigned_to': params.get('assigned_to')
        }
    
    async def _assign_user(self, params: Dict, context: Dict) -> Dict:
        """Assign user to opportunity/proposal"""
        return {
            'success': True,
            'action': 'assign_user',
            'user_id': params.get('user_id'),
            'resource_id': context.get('id')
        }
    
    async def _update_status(self, params: Dict, context: Dict) -> Dict:
        """Update status of opportunity/proposal"""
        return {
            'success': True,
            'action': 'update_status',
            'resource_id': context.get('id'),
            'new_status': params.get('status')
        }
    
    async def _generate_report(self, params: Dict, context: Dict) -> Dict:
        """Generate automated report"""
        return {
            'success': True,
            'action': 'generate_report',
            'report_type': params.get('report_type'),
            'report_id': f"report_{datetime.utcnow().timestamp()}"
        }
    
    async def _run_ai_analysis(self, params: Dict, context: Dict) -> Dict:
        """Run AI analysis"""
        return {
            'success': True,
            'action': 'run_ai_analysis',
            'analysis_type': params.get('analysis_type'),
            'result': 'AI analysis would run in production'
        }
    
    async def _call_webhook(self, params: Dict, context: Dict) -> Dict:
        """Call external webhook"""
        # In production: make HTTP request
        return {
            'success': True,
            'action': 'webhook',
            'url': params.get('url'),
            'method': params.get('method', 'POST')
        }
    
    async def _notify_team(self, params: Dict, context: Dict) -> Dict:
        """Notify team members"""
        return {
            'success': True,
            'action': 'notify_team',
            'team_id': params.get('team_id'),
            'message': params.get('message', '').format(**context)
        }
    
    def get_workflow(self, workflow_id: str) -> Optional[Dict]:
        """Get workflow by ID"""
        return self.workflows.get(workflow_id)
    
    def list_workflows(self, enabled_only: bool = False) -> List[Dict]:
        """List all workflows"""
        workflows = list(self.workflows.values())
        if enabled_only:
            workflows = [wf for wf in workflows if wf['enabled']]
        return workflows
    
    def enable_workflow(self, workflow_id: str):
        """Enable a workflow"""
        if workflow_id in self.workflows:
            self.workflows[workflow_id]['enabled'] = True
            if workflow_id not in self.active_workflows:
                self.active_workflows.append(workflow_id)
    
    def disable_workflow(self, workflow_id: str):
        """Disable a workflow"""
        if workflow_id in self.workflows:
            self.workflows[workflow_id]['enabled'] = False
            if workflow_id in self.active_workflows:
                self.active_workflows.remove(workflow_id)
    
    def delete_workflow(self, workflow_id: str):
        """Delete a workflow"""
        if workflow_id in self.workflows:
            del self.workflows[workflow_id]
            if workflow_id in self.active_workflows:
                self.active_workflows.remove(workflow_id)
    
    def get_execution_history(
        self,
        workflow_id: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Get workflow execution history"""
        history = self.execution_history
        
        if workflow_id:
            history = [h for h in history if h['workflow_id'] == workflow_id]
        
        return history[-limit:]


# Predefined workflow templates
WORKFLOW_TEMPLATES = [
    {
        'name': 'Auto-qualify high-scoring opportunities',
        'description': 'Automatically move opportunities with 85+ compliance score to Qualified stage',
        'trigger': {'type': 'opportunity_created'},
        'conditions': [{'field': 'compliance_score', 'operator': '>=', 'value': 85}],
        'actions': [
            {'type': 'update_status', 'params': {'status': 'qualified'}},
            {'type': 'send_email', 'params': {'to': 'team@company.com', 'subject': 'High-scoring opportunity: {title}'}}
        ]
    },
    {
        'name': 'Deadline reminder - 7 days',
        'description': 'Send reminder when proposal deadline is 7 days away',
        'trigger': {'type': 'deadline_approaching'},
        'conditions': [{'field': 'days_to_deadline', 'operator': '==', 'value': 7}],
        'actions': [
            {'type': 'send_email', 'params': {'to': 'proposal_team@company.com', 'subject': 'Deadline in 7 days: {title}'}},
            {'type': 'send_slack', 'params': {'channel': '#proposals', 'message': '⚠️ Deadline in 7 days for {title}'}}
        ]
    },
    {
        'name': 'New opportunity AI analysis',
        'description': 'Run AI analysis on every new opportunity',
        'trigger': {'type': 'opportunity_created'},
        'conditions': [],
        'actions': [
            {'type': 'run_ai_analysis', 'params': {'analysis_type': 'full'}},
            {'type': 'notify_team', 'params': {'team_id': 'capture_team', 'message': 'New opportunity analyzed: {title}'}}
        ]
    }
]


# Global instance
workflow_automation_service = WorkflowAutomationService()

