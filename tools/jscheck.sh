#!/bin/bash
# 语法检查：通用模块 + 页面内联脚本拼接后 node --check
f=$1; python3 -c "
import re,sys;s=open('$f').read();open('/tmp/_s.js','w').write('\n'.join(re.findall(r'<script>([\s\S]*?)</script>',s)))"
srcs=$(grep -o 'src="[^"]*common/[^"]*"' "$f" | sed 's/src="//;s/"//' | sed "s#^\.\./\.\./#$(dirname $0)/../#")
cat $srcs /tmp/_s.js > /tmp/_all.js && node --check /tmp/_all.js && echo "语法 OK: $f"
