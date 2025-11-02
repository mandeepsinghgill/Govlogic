#!/usr/bin/env python3
"""
Convert Markdown Report to PDF
Uses markdown2 and weasyprint for PDF generation
"""

import sys
import os

def convert_markdown_to_html(md_file):
    """Convert markdown to HTML"""
    try:
        import markdown2
    except ImportError:
        print("Installing markdown2...")
        os.system(f"{sys.executable} -m pip install markdown2 -q")
        import markdown2
    
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Convert markdown to HTML with extras
    html_content = markdown2.markdown(
        md_content, 
        extras=[
            "tables", 
            "fenced-code-blocks", 
            "header-ids",
            "strike",
            "task_list"
        ]
    )
    
    # Create full HTML document with styling
    full_html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Project Comparison Report</title>
    <style>
        @page {{
            size: letter;
            margin: 1in;
            @bottom-center {{
                content: "Page " counter(page) " of " counter(pages);
            }}
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0;
            padding: 20px;
        }}
        
        h1 {{
            color: #1a1a1a;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 10px;
            margin-top: 30px;
            page-break-before: auto;
        }}
        
        h2 {{
            color: #0066cc;
            border-bottom: 2px solid #ccc;
            padding-bottom: 8px;
            margin-top: 25px;
            page-break-after: avoid;
        }}
        
        h3 {{
            color: #0088cc;
            margin-top: 20px;
            page-break-after: avoid;
        }}
        
        h4 {{
            color: #00aacc;
            margin-top: 15px;
        }}
        
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
            page-break-inside: avoid;
            font-size: 11px;
        }}
        
        table th {{
            background-color: #0066cc;
            color: white;
            font-weight: bold;
            padding: 10px;
            text-align: left;
            border: 1px solid #0066cc;
        }}
        
        table td {{
            padding: 8px;
            border: 1px solid #ddd;
        }}
        
        table tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        
        table tr:hover {{
            background-color: #f5f5f5;
        }}
        
        code {{
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.9em;
        }}
        
        pre {{
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            page-break-inside: avoid;
        }}
        
        pre code {{
            background-color: transparent;
            padding: 0;
        }}
        
        ul, ol {{
            margin: 10px 0;
            padding-left: 30px;
        }}
        
        li {{
            margin: 5px 0;
        }}
        
        blockquote {{
            border-left: 4px solid #0066cc;
            padding-left: 15px;
            margin: 15px 0;
            color: #666;
            font-style: italic;
        }}
        
        hr {{
            border: none;
            border-top: 2px solid #ccc;
            margin: 30px 0;
        }}
        
        .status-present {{
            color: #00aa00;
            font-weight: bold;
        }}
        
        .status-missing {{
            color: #cc0000;
            font-weight: bold;
        }}
        
        .status-partial {{
            color: #ff8800;
            font-weight: bold;
        }}
        
        a {{
            color: #0066cc;
            text-decoration: none;
        }}
        
        a:hover {{
            text-decoration: underline;
        }}
        
        .page-break {{
            page-break-after: always;
        }}
        
        @media print {{
            body {{
                font-size: 11pt;
            }}
            
            h1 {{
                page-break-before: always;
            }}
            
            h1:first-of-type {{
                page-break-before: avoid;
            }}
        }}
    </style>
</head>
<body>
{html_content}
</body>
</html>
"""
    
    return full_html

def convert_html_to_pdf(html_content, pdf_file):
    """Convert HTML to PDF using weasyprint"""
    try:
        from weasyprint import HTML, CSS
    except ImportError:
        print("Installing weasyprint...")
        os.system(f"{sys.executable} -m pip install weasyprint -q")
        from weasyprint import HTML, CSS
    
    print("Generating PDF...")
    HTML(string=html_content).write_pdf(pdf_file)
    print(f"✅ PDF generated successfully: {pdf_file}")

def main():
    md_file = "PROJECT_COMPARISON_REPORT.md"
    pdf_file = "PROJECT_COMPARISON_REPORT.pdf"
    
    if not os.path.exists(md_file):
        print(f"❌ Error: {md_file} not found")
        return
    
    print(f"📄 Converting {md_file} to PDF...")
    
    # Convert markdown to HTML
    html_content = convert_markdown_to_html(md_file)
    
    # Save HTML temporarily for debugging
    html_file = "PROJECT_COMPARISON_REPORT.html"
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"✅ HTML generated: {html_file}")
    
    # Convert HTML to PDF
    try:
        convert_html_to_pdf(html_content, pdf_file)
        print(f"\n🎉 Report successfully converted to PDF!")
        print(f"📍 Location: {os.path.abspath(pdf_file)}")
        print(f"📊 File size: {os.path.getsize(pdf_file) / 1024:.1f} KB")
    except Exception as e:
        print(f"❌ Error generating PDF: {e}")
        print("ℹ️  HTML version available at:", html_file)
        print("ℹ️  You can open the HTML file in a browser and print to PDF")

if __name__ == "__main__":
    main()

