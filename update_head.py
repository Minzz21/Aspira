import os

files = [
    'dashboard.html',
    'profil-desa/profil-desa.html',
    'aspirasi-warga/aspirasi-warga.html',
    'whitelist-warga/whitelist-warga.html',
    'akun-warga/akun-warga.html',
    'pengaturan/pengaturan.html'
]

inline_script = """  <script>
    if (localStorage.getItem('sidebar_collapsed') === 'true') {
      document.documentElement.classList.add('sidebar-is-collapsed');
    }
  </script>
</head>"""

for file_path in files:
    full_path = os.path.join('d:/Random/Aspira', file_path)
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'sidebar-is-collapsed' not in content:
        content = content.replace('</head>', inline_script)
        
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f'Updated {file_path}')
