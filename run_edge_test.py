import subprocess
import os
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

test_file = sys.argv[1] if len(sys.argv) > 1 else "test-gec-dataset.html"

url = "file:///" + os.path.abspath(test_file).replace("\\", "/")
cmd = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "--headless=new",
    "--disable-gpu",
    "--virtual-time-budget=2000",
    "--dump-dom",
    url
]
res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
m = re.search(r'<pre[^>]*>(.*?)</pre>', res.stdout, re.DOTALL)
if m:
    print(m.group(1))
else:
    print("Pre tag not found or empty. Output was:")
    print(res.stdout[:500])
