import sys

file_path = r'c:\Learning\seminarv1\vinh_khanh_food_tour\frontend-admin\src\pages\Analytics.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_content = """                <div className=\"stat-card\" style={{ border: '2px solid var(--clr-accent)', background: 'var(--clr-bg-alt)' }}>
                  <div className=\"stat-info\">
                    <div className=\"stat-label\" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--clr-accent)' }}>
                      <span className=\"live-dot\" style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                      Đang Online (Realtime)
                    </div>
                    <div className=\"stat-value\" style={{ color: 'var(--clr-accent)', fontSize: '1.75rem' }}>{onlineCount}</div>
                  </div>
                </div>\n"""

lines.insert(162, new_content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
