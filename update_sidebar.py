import os
import re

files = [
    'dashboard.html',
    'profil-desa/profil-desa.html',
    'aspirasi-warga/aspirasi-warga.html',
    'whitelist-warga/whitelist-warga.html',
    'akun-warga/akun-warga.html',
    'pengaturan/pengaturan.html'
]

for file_path in files:
    full_path = os.path.join('d:/Random/Aspira', file_path)
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine prefix
    is_root = file_path == 'dashboard.html'
    prefix = '' if is_root else '../'

    # Add CSS & JS
    if 'shared/sidebar.css' not in content:
        content = content.replace('</head>', f'  <link rel="stylesheet" href="{prefix}shared/sidebar.css"/>\n</head>')
    if 'shared/sidebar.js' not in content:
        content = content.replace('</body>', f'  <script src="{prefix}shared/sidebar.js"></script>\n</body>')

    # Update <aside>
    content = re.sub(
        r'<aside class="w-56 flex flex-col bg-\[#1e4d2b\] text-white flex-shrink-0">',
        r'<aside id="sidebar" class="w-56 relative flex flex-col bg-[#1e4d2b] text-white flex-shrink-0 transition-all duration-300 z-20">\n    <button id="sidebar-toggle" class="absolute -right-3 top-7 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white border-2 border-gray-100 hover:bg-green-600 transition z-50">\n      <i class="fa-solid fa-chevron-left text-[10px] transition-transform duration-300" id="sidebar-toggle-icon"></i>\n    </button>',
        content
    )

    # Update Header
    content = re.sub(
        r'<div class="px-5 py-5 border-b border-green-800">\s*<div class="flex items-center gap-3">\s*<img src="([^"]+)" alt="ASPIRA AI" class="w-9 h-9 rounded-md object-cover"/>\s*<div>\s*<p class="font-bold text-sm leading-tight">ASPIRA AI</p>\s*<p class="text-green-300 text-\[10px\]">Portal Tata Kelola</p>\s*</div>\s*</div>\s*</div>',
        r'<div class="sidebar-header px-5 py-5 border-b border-green-800 flex items-center justify-between">\n      <div class="flex items-center gap-3 overflow-hidden">\n        <img src="\1" alt="ASPIRA AI" class="w-9 h-9 rounded-md object-cover flex-shrink-0"/>\n        <div class="sidebar-text whitespace-nowrap">\n          <p class="font-bold text-sm leading-tight">ASPIRA AI</p>\n          <p class="text-green-300 text-[10px]">Portal Tata Kelola</p>\n        </div>\n      </div>\n    </div>',
        content
    )

    # Update Nav Items
    def replace_nav_item(match):
        a_tag = match.group(1)
        i_tag = match.group(2)
        text = match.group(3).strip()
        
        if 'data-title' not in a_tag:
            a_tag_modified = a_tag.replace('>', f' data-title="{text}">')
        else:
            a_tag_modified = a_tag
            
        if 'flex-shrink-0' not in i_tag:
            i_tag_modified = i_tag.replace('class="', 'class="flex-shrink-0 ')
        else:
            i_tag_modified = i_tag
            
        if '<span class="sidebar-text' not in text:
            text_modified = f'\n        <span class="sidebar-text whitespace-nowrap">{text}</span>\n      '
        else:
            text_modified = f'\n        {text}\n      '
            
        return f'{a_tag_modified}\n        {i_tag_modified}{text_modified}</a>'

    content = re.sub(
        r'(<a[^>]*class="[^"]*sidebar-item[^"]*"[^>]*>)\s*(<i[^>]*></i>)\s*([A-Za-z0-9&; \-]+?)\s*</a>',
        replace_nav_item,
        content
    )

    # Update Bottom User section (Handling both Avatar types)
    # Type 1: img tag
    content = re.sub(
        r'<div class="flex items-center gap-3 px-3 py-2 mt-1">\s*<img src="([^"]+)" class="w-9 h-9 rounded-full" alt="Admin"/>\s*<div>\s*<p class="[^"]*">Admin Utama</p>\s*<p class="[^"]*">Administrator</p>\s*</div>\s*</div>',
        r'<div class="sidebar-user-section flex items-center gap-3 px-3 py-2 mt-1 overflow-hidden">\n        <img src="\1" class="w-9 h-9 rounded-full flex-shrink-0" alt="Admin"/>\n        <div class="sidebar-text whitespace-nowrap">\n          <p class="text-sm font-semibold leading-tight">Admin Utama</p>\n          <p class="text-green-300 text-[10px]">Administrator</p>\n        </div>\n      </div>',
        content
    )
    # Type 2: div tag (in pengaturan.html)
    content = re.sub(
        r'<div class="flex items-center gap-3 px-3 py-2 mt-1">\s*<div id="sidebar-avatar" class="w-9 h-9 rounded-full bg-green-400 flex items-center justify-center text-\[#1e4d2b\] font-bold text-sm flex-shrink-0">A</div>\s*<div>\s*<p class="text-sm font-semibold leading-tight" id="sidebar-name">Admin Utama</p>\s*<p class="text-green-300 text-\[10px\]" id="sidebar-role">Administrator</p>\s*</div>\s*</div>',
        r'<div class="sidebar-user-section flex items-center gap-3 px-3 py-2 mt-1 overflow-hidden">\n        <div id="sidebar-avatar" class="w-9 h-9 rounded-full bg-green-400 flex items-center justify-center text-[#1e4d2b] font-bold text-sm flex-shrink-0">A</div>\n        <div class="sidebar-text whitespace-nowrap">\n          <p class="text-sm font-semibold leading-tight" id="sidebar-name">Admin Utama</p>\n          <p class="text-green-300 text-[10px]" id="sidebar-role">Administrator</p>\n        </div>\n      </div>',
        content
    )

    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {file_path}')
