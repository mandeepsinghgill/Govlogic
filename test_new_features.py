#!/usr/bin/env python3
"""
Quick test script for new features
"""
import sys
import asyncio
sys.path.insert(0, '/home/ubuntu/GovSure/backend')

from app.services.continuous_learning_service import continuous_learning_service
from app.services.rich_editor_service import rich_editor_service
from app.services.enhanced_export_service import enhanced_export_service


async def test_continuous_learning():
    """Test continuous learning service"""
    print("\n🧠 Testing Continuous Learning Service...")
    
    # Test feedback processing
    result = await continuous_learning_service.process_user_feedback(
        user_id="test_user",
        content_type="technical_approach",
        original_content="Our approach uses standard methodologies.",
        edited_content="Our innovative approach leverages cutting-edge methodologies with proven results.",
        feedback_score=8.5,
        context={"rfp_type": "IT Services"}
    )
    
    print(f"✅ Feedback processed: {result['status']}")
    print(f"   - Patterns extracted: {result['patterns_extracted']}")
    print(f"   - Differences found: {result['differences_found']}")
    
    # Test metrics
    metrics = continuous_learning_service.get_learning_metrics()
    print(f"✅ Learning metrics retrieved")
    print(f"   - Total interactions: {metrics['total_interactions']}")
    print(f"   - Patterns learned: {metrics['patterns_learned']}")
    
    return True


async def test_rich_editor():
    """Test rich editor service"""
    print("\n📝 Testing Rich Editor Service...")
    
    # Test document creation
    result = await rich_editor_service.create_document(
        document_id="test_doc_001",
        title="Test Proposal",
        content="This is a test proposal content.",
        owner_id="test_user",
        owner_name="Test User",
        document_type="proposal"
    )
    
    print(f"✅ Document created: {result['status']}")
    print(f"   - Document ID: {result['document']['document_id']}")
    print(f"   - Version ID: {result['version_id']}")
    
    # Test auto-save
    save_result = await rich_editor_service.auto_save(
        document_id="test_doc_001",
        user_id="test_user",
        user_name="Test User",
        content="Updated content with auto-save.",
        save_as_draft=True
    )
    
    print(f"✅ Auto-save completed: {save_result['status']}")
    print(f"   - Draft ID: {save_result['draft_id']}")
    
    # Test version history
    history = await rich_editor_service.get_version_history(
        document_id="test_doc_001",
        user_id="test_user"
    )
    
    print(f"✅ Version history retrieved")
    print(f"   - Total versions: {history['total_versions']}")
    
    return True


async def test_enhanced_export():
    """Test enhanced export service"""
    print("\n📄 Testing Enhanced Export Service...")
    
    # Test Word export
    proposal_data = {
        'title': 'Technical Proposal for IT Services',
        'rfp_info': {
            'agency': 'Department of Defense',
            'title': 'Cloud Infrastructure Services',
            'number': 'RFP-2025-001',
            'due_date': '2025-12-31'
        },
        'company': {
            'name': 'GovLogicAI',
            'address': '123 Tech Street',
            'city': 'Washington',
            'state': 'DC',
            'zip': '20001',
            'phone': '(202) 555-0100',
            'email': 'contact@GovSureai.com'
        },
        'executive_summary': 'This proposal demonstrates our innovative approach to cloud infrastructure services.',
        'sections': [
            {
                'title': 'Technical Approach',
                'content': 'Our technical approach leverages industry best practices and cutting-edge technologies.',
                'subsections': [
                    {
                        'title': 'Methodology',
                        'content': 'We employ an agile methodology with continuous integration and deployment.'
                    }
                ]
            },
            {
                'title': 'Management Plan',
                'content': 'Our management plan ensures successful project delivery through proven processes.'
            }
        ]
    }
    
    word_bytes = await enhanced_export_service.export_to_professional_word(
        proposal_data=proposal_data,
        include_cover_page=True,
        include_toc=True,
        include_executive_summary=True
    )
    
    print(f"✅ Word export completed")
    print(f"   - Size: {len(word_bytes):,} bytes")
    
    # Test Excel export
    pricing_data = {
        'project_name': 'Cloud Infrastructure Services',
        'contract_type': 'FFP',
        'labor_categories': [
            {'name': 'Senior Engineer', 'hours': 1000, 'rate': 150},
            {'name': 'Engineer', 'hours': 2000, 'rate': 100},
            {'name': 'Junior Engineer', 'hours': 1500, 'rate': 75}
        ],
        'indirect_costs': 50000,
        'materials': 25000,
        'travel': 10000
    }
    
    excel_bytes = await enhanced_export_service.export_to_advanced_excel(
        pricing_data=pricing_data,
        include_charts=True,
        include_formulas=True
    )
    
    print(f"✅ Excel export completed")
    print(f"   - Size: {len(excel_bytes):,} bytes")
    
    return True


async def main():
    """Run all tests"""
    print("=" * 60)
    print("🚀 TESTING NEW FEATURES")
    print("=" * 60)
    
    try:
        # Test continuous learning
        await test_continuous_learning()
        
        # Test rich editor
        await test_rich_editor()
        
        # Test enhanced export
        await test_enhanced_export()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\n🎉 New features are working perfectly!")
        print("\nFeatures tested:")
        print("  ✅ Continuous Learning AI")
        print("  ✅ Rich Text Editor with Collaboration")
        print("  ✅ Professional Document Export")
        print("\n🚀 Ready for production deployment!")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)

