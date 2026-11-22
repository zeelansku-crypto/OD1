import re

with open('d:/CONV/ConvocationWebApp-27De2025/ConvocationWebApp/client/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the select element for partIISelect
select_match = re.search(r'<select name="part_ii" id="partIISelect".*?>(.*?)</select>', content, re.DOTALL)
if select_match:
    options_html = select_match.group(1)
    options = re.findall(r'<option value="([^"]+)">(.*?)</option>', options_html, re.DOTALL)
    
    js_array = []
    for val, text in options:
        if val: # Skip empty "Select Option"
            # Clean up whitespace in text
            text = ' '.join(text.split())
            js_array.append([val, text])
    
    print("const partIIOptions = [")
    for opt in js_array:
        print(f"    {opt},")
    print("];")
else:
    print("Select element not found")
