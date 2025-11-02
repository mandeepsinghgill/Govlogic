#!/usr/bin/env python3
"""
Convert Markdown Report to Print-Ready HTML
This creates an HTML file that can be printed to PDF from any browser
"""

import re
import os

def convert_markdown_to_html(md_content):
    """Simple markdown to HTML converter"""
    html = md_content
    
    # Headers
    html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^#### (.+)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    
    # Bold and Italic
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)
    
    # Code blocks
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)
    
    # Links
    html = re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', r'<a href="\2">\1</a>', html)
    
    # Horizontal rules
    html = re.sub(r'^---+$', r'<hr>', html, flags=re.MULTILINE)
    
    # Lists - simple unordered lists
    html = re.sub(r'^- (.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'^  - (.+)$', r'<ul><li>\1</li></ul>', html, flags=re.MULTILINE)
    
    # Wrap consecutive list items
    html = re.sub(r'(<li>.*?</li>\n)+', lambda m: '<ul>' + m.group(0) + '</ul>\n', html)
    
    # Paragraphs
    lines = html.split('\n')
    processed = []
    in_list = False
    in_table = False
    
    for line in lines:
        line = line.strip()
        if not line:
            processed.append('<br>')
        elif line.startswith('<'):
            processed.append(line)
            if '<ul>' in line or '<ol>' in line:
                in_list = True
            elif '</ul>' in line or '</ol>' in line:
                in_list = False
            if '<table>' in line:
                in_table = True
            elif '</table>' in line:
                in_table = False
        elif line.startswith('|'):
            # Table row
            if not in_table:
                processed.append('<table>')
                in_table = True
            cells = [c.strip() for c in line.split('|')[1:-1]]
            if all(c.replace('-', '').replace(':', '').strip() == '' for c in cells):
                # Header separator
                continue
            row_html = '<tr>'
            for cell in cells:
                # Check if this is a header row (first row after opening table)
                if processed[-1] == '<table>':
                    row_html += f'<th>{cell}</th>'
                else:
                    row_html += f'<td>{cell}</td>'
            row_html += '</tr>'
            processed.append(row_html)
        else:
            if in_table:
                processed.append('</table>')
                in_table = False
            if not in_list:
                processed.append(f'<p>{line}</p>')
            else:
                processed.append(line)
    
    if in_table:
        processed.append('</table>')
    
    return '\n'.join(processed)

def create_html_document(md_file):
    """Create a complete HTML document from markdown file"""
    
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    html_body = convert_markdown_to_html(md_content)
    
    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Comparison Report - GovConAISuite vs GovSure</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        @page {{
            size: letter;
            margin: 0.75in;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: white;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }}
        
        h1 {{
            color: #0066cc;
            font-size: 28px;
            margin: 30px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 3px solid #0066cc;
            page-break-after: avoid;
        }}
        
        h1:first-of-type {{
            margin-top: 0;
            font-size: 32px;
            text-align: center;
            border-bottom: none;
        }}
        
        h2 {{
            color: #0077dd;
            font-size: 22px;
            margin: 25px 0 12px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #ccc;
            page-break-after: avoid;
        }}
        
        h3 {{
            color: #0088ee;
            font-size: 18px;
            margin: 20px 0 10px 0;
            page-break-after: avoid;
        }}
        
        h4 {{
            color: #0099ff;
            font-size: 16px;
            margin: 15px 0 8px 0;
            page-break-after: avoid;
        }}
        
        p {{
            margin: 10px 0;
        }}
        
        ul, ol {{
            margin: 10px 0 10px 25px;
        }}
        
        li {{
            margin: 5px 0;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 12px;
            page-break-inside: avoid;
        }}
        
        th {{
            background-color: #0066cc;
            color: white;
            font-weight: bold;
            padding: 12px 8px;
            text-align: left;
            border: 1px solid #0066cc;
        }}
        
        td {{
            padding: 10px 8px;
            border: 1px solid #ddd;
        }}
        
        tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        
        code {{
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.9em;
            color: #c7254e;
        }}
        
        strong {{
            color: #0066cc;
            font-weight: 600;
        }}
        
        em {{
            font-style: italic;
            color: #555;
        }}
        
        hr {{
            border: none;
            border-top: 2px solid #ccc;
            margin: 30px 0;
        }}
        
        a {{
            color: #0066cc;
            text-decoration: none;
        }}
        
        a:hover {{
            text-decoration: underline;
        }}
        
        .print-button {{
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background-color: #0066cc;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
        }}
        
        .print-button:hover {{
            background-color: #0055aa;
        }}
        
        @media print {{
            body {{
                padding: 0;
                font-size: 10pt;
            }}
            
            .print-button {{
                display: none;
            }}
            
            h1 {{
                page-break-before: auto;
            }}
            
            table {{
                font-size: 9pt;
            }}
            
            a {{
                color: #0066cc;
                text-decoration: none;
            }}
            
            a[href]:after {{
                content: none;
            }}
        }}
        
        @media screen and (max-width: 768px) {{
            body {{
                padding: 10px;
            }}
            
            table {{
                font-size: 10px;
            }}
            
            th, td {{
                padding: 6px 4px;
            }}
        }}
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Print to PDF</button>
    
    {html_body}
    
    <script>
        // Add click handler for print button
        document.addEventListener('DOMContentLoaded', function() {{
            console.log('Report loaded successfully');
        }});
    </script>
</body>
</html>"""
    
    return full_html

def main():
    md_file = "PROJECT_COMPARISON_REPORT.md"
    html_file = "PROJECT_COMPARISON_REPORT.html"
    
    if not os.path.exists(md_file):
        print(f"❌ Error: {md_file} not found")
        return
    
    print(f"📄 Converting {md_file} to HTML...")
    
    # Create HTML document
    html_content = create_html_document(md_file)
    
    # Save HTML file
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ HTML generated successfully: {html_file}")
    print(f"📍 Location: {os.path.abspath(html_file)}")
    print(f"📊 File size: {os.path.getsize(html_file) / 1024:.1f} KB")
    print()
    print("📖 HOW TO CREATE PDF:")
    print("   1. Open the HTML file in any web browser (Chrome, Safari, Firefox)")
    print(f"   2. Click the '🖨️ Print to PDF' button or press Cmd+P (Mac) / Ctrl+P (Windows)")
    print("   3. Select 'Save as PDF' as the destination")
    print("   4. Save the PDF file")
    print()
    print(f"🌐 Or open directly: file://{os.path.abspath(html_file)}")

if __name__ == "__main__":
    main()

