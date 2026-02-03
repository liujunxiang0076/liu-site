---
title: Linux常用命令完全指南：从基础到进阶的命令行操作
tags: [Linux, 命令行, Shell, 运维, 系统管理]
categories: [技术分享]
date: 2025-12-31
description: 本文全面梳理Linux系统中最常用的命令，从文件操作到系统管理，从基础命令到高级技巧，帮助开发者和运维人员掌握Linux命令行操作。
articleGPT: Linux命令行是系统管理和开发工作的核心工具。本文系统性地整理了Linux中最常用的命令，包括文件操作、文本处理、系统监控、网络管理等各个方面，并提供大量实用示例，帮助读者快速掌握Linux命令行操作技能。
cover: https://imgbed.liujunxiang0076.site/file/1770102200401_linux最常用命令速查.jpg
---

# Linux常用命令完全指南：从基础到进阶的命令行操作

## 一、文件和目录操作

### 1.1 基础导航命令

#### pwd - 显示当前目录
```bash
# 显示当前工作目录的完整路径
pwd

# 输出示例：/home/username/documents
```

#### ls - 列出目录内容
```bash
# 基本用法
ls                    # 列出当前目录内容
ls /home             # 列出指定目录内容

# 常用选项
ls -l                # 详细信息（长格式）
ls -a                # 显示隐藏文件
ls -la               # 详细信息 + 隐藏文件
ls -lh               # 人性化显示文件大小
ls -lt               # 按修改时间排序
ls -lS               # 按文件大小排序
ls -R                # 递归显示子目录

# 实用组合
ls -lah              # 最常用的组合
ls -ltr              # 按时间倒序，最新文件在底部
```

#### cd - 切换目录
```bash
cd /path/to/directory    # 切换到指定目录
cd ~                     # 切换到家目录
cd                       # 同上，切换到家目录
cd -                     # 切换到上一个目录
cd ..                    # 切换到父目录
cd ../..                 # 切换到上两级目录
cd ./subdirectory        # 切换到当前目录下的子目录
```

### 1.2 文件和目录创建

#### mkdir - 创建目录
```bash
mkdir directory_name          # 创建单个目录
mkdir dir1 dir2 dir3         # 创建多个目录
mkdir -p path/to/directory   # 创建多级目录（父目录不存在时自动创建）
mkdir -m 755 directory       # 创建目录并设置权限
```

#### touch - 创建文件或更新时间戳
```bash
touch filename.txt           # 创建空文件或更新时间戳
touch file1.txt file2.txt   # 创建多个文件
touch -t 202312311200 file  # 设置特定时间戳
```

### 1.3 文件和目录复制、移动、删除

#### cp - 复制文件和目录
```bash
# 复制文件
cp source.txt destination.txt        # 复制文件
cp source.txt /path/to/destination/  # 复制到指定目录

# 复制目录
cp -r source_dir destination_dir     # 递归复制目录
cp -a source_dir destination_dir     # 保持所有属性复制

# 常用选项
cp -i source.txt dest.txt           # 交互模式，覆盖前询问
cp -u source.txt dest.txt           # 只在源文件更新时复制
cp -v source.txt dest.txt           # 显示详细过程
```

#### mv - 移动/重命名文件和目录
```bash
mv oldname.txt newname.txt          # 重命名文件
mv file.txt /path/to/destination/   # 移动文件
mv directory /new/location/         # 移动目录
mv *.txt /backup/                   # 移动所有txt文件

# 常用选项
mv -i source dest                   # 交互模式
mv -u source dest                   # 只在源文件更新时移动
mv -v source dest                   # 显示详细过程
```

#### rm - 删除文件和目录
```bash
rm filename.txt                     # 删除文件
rm file1.txt file2.txt             # 删除多个文件
rm -r directory                     # 递归删除目录
rm -rf directory                    # 强制递归删除（危险！）

# 安全选项
rm -i filename.txt                  # 交互模式，删除前询问
rm -I *.txt                        # 删除多个文件前询问一次
rm -v filename.txt                  # 显示删除过程

# 注意：rm -rf 命令非常危险，使用前请三思！
```

### 1.4 查找文件和目录

#### find - 强大的文件查找工具
```bash
# 基本语法
find /path/to/search -name "filename"

# 按名称查找
find . -name "*.txt"                # 查找当前目录下所有txt文件
find /home -name "config*"          # 查找以config开头的文件
find . -iname "*.PDF"               # 忽略大小写查找

# 按类型查找
find . -type f                      # 查找文件
find . -type d                      # 查找目录
find . -type l                      # 查找符号链接

# 按大小查找
find . -size +100M                  # 查找大于100MB的文件
find . -size -1k                    # 查找小于1KB的文件
find . -size 50c                    # 查找正好50字节的文件

# 按时间查找
find . -mtime -7                    # 查找7天内修改的文件
find . -atime +30                   # 查找30天前访问的文件
find . -ctime -1                    # 查找1天内状态改变的文件

# 按权限查找
find . -perm 644                    # 查找权限为644的文件
find . -perm -u+x                   # 查找用户有执行权限的文件

# 执行操作
find . -name "*.tmp" -delete        # 查找并删除tmp文件
find . -name "*.log" -exec rm {} \; # 查找并删除log文件
find . -type f -exec chmod 644 {} \; # 查找文件并设置权限
```

#### locate - 快速文件定位
```bash
# 更新数据库（通常由cron自动执行）
sudo updatedb

# 查找文件
locate filename.txt                 # 快速查找文件
locate -i filename                  # 忽略大小写
locate -c filename                  # 只显示匹配数量
locate -r "\.txt$"                  # 使用正则表达式
```

#### which - 查找命令位置
```bash
which python                        # 查找python命令的位置
which -a python                     # 显示所有匹配的路径
```

#### whereis - 查找命令、源码、手册
```bash
whereis python                      # 查找python相关文件
whereis -b python                   # 只查找二进制文件
whereis -m python                   # 只查找手册页
```
## 二、文本处理命令

### 2.1 查看文件内容

#### cat - 显示文件内容
```bash
cat filename.txt                    # 显示文件内容
cat file1.txt file2.txt            # 连接显示多个文件
cat -n filename.txt                 # 显示行号
cat -b filename.txt                 # 只对非空行显示行号
cat -A filename.txt                 # 显示所有字符（包括不可见字符）

# 创建文件
cat > newfile.txt                   # 创建新文件（Ctrl+D结束）
cat >> existingfile.txt             # 追加内容到文件
```

#### less/more - 分页查看文件
```bash
less filename.txt                   # 分页查看文件（推荐）
more filename.txt                   # 分页查看文件

# less 常用快捷键
# 空格键：下一页
# b：上一页
# /pattern：向下搜索
# ?pattern：向上搜索
# n：下一个匹配
# N：上一个匹配
# q：退出
```

#### head/tail - 查看文件开头和结尾
```bash
head filename.txt                   # 显示前10行
head -n 20 filename.txt             # 显示前20行
head -c 100 filename.txt            # 显示前100个字符

tail filename.txt                   # 显示后10行
tail -n 20 filename.txt             # 显示后20行
tail -f filename.txt                # 实时监控文件变化（常用于日志）
tail -F filename.txt                # 类似-f，但文件被删除重建时继续监控
```

### 2.2 文本搜索和过滤

#### grep - 文本搜索工具
```bash
# 基本搜索
grep "pattern" filename.txt         # 在文件中搜索模式
grep "pattern" *.txt                # 在多个文件中搜索
grep -r "pattern" /path/to/dir      # 递归搜索目录

# 常用选项
grep -i "pattern" file              # 忽略大小写
grep -v "pattern" file              # 反向匹配（不包含pattern的行）
grep -n "pattern" file              # 显示行号
grep -c "pattern" file              # 只显示匹配行数
grep -l "pattern" *.txt             # 只显示包含匹配的文件名
grep -w "word" file                 # 匹配整个单词
grep -A 3 "pattern" file            # 显示匹配行及后3行
grep -B 3 "pattern" file            # 显示匹配行及前3行
grep -C 3 "pattern" file            # 显示匹配行及前后3行

# 正则表达式
grep "^start" file                  # 匹配以start开头的行
grep "end$" file                    # 匹配以end结尾的行
grep "[0-9]" file                   # 匹配包含数字的行
grep -E "pattern1|pattern2" file    # 匹配多个模式（扩展正则）
```

#### awk - 强大的文本处理工具
```bash
# 基本用法
awk '{print $1}' file               # 打印第一列
awk '{print $1, $3}' file          # 打印第一列和第三列
awk '{print NF}' file               # 打印每行的字段数
awk '{print NR, $0}' file          # 打印行号和整行内容

# 条件处理
awk '$3 > 100' file                 # 打印第三列大于100的行
awk '/pattern/ {print $1}' file     # 匹配pattern的行，打印第一列
awk 'NR==5' file                    # 打印第5行
awk 'NR>=5 && NR<=10' file          # 打印第5到10行

# 计算和统计
awk '{sum += $1} END {print sum}' file    # 计算第一列的总和
awk '{print $1, $2, $1+$2}' file          # 打印前两列及其和
awk -F: '{print $1}' /etc/passwd           # 指定分隔符为冒号

# 实用示例
ps aux | awk '{print $1, $2, $11}'        # 显示进程的用户、PID和命令
df -h | awk '$5 > "80%" {print $0}'       # 显示磁盘使用率超过80%的分区
```

#### sed - 流编辑器
```bash
# 替换操作
sed 's/old/new/' file               # 替换每行第一个匹配
sed 's/old/new/g' file              # 替换所有匹配
sed 's/old/new/2' file              # 替换每行第二个匹配
sed -i 's/old/new/g' file           # 直接修改文件

# 删除操作
sed '5d' file                       # 删除第5行
sed '2,5d' file                     # 删除第2到5行
sed '/pattern/d' file               # 删除包含pattern的行
sed '/^$/d' file                    # 删除空行

# 插入和追加
sed '3i\New line' file              # 在第3行前插入
sed '3a\New line' file              # 在第3行后追加
sed '/pattern/i\New line' file      # 在匹配行前插入

# 打印操作
sed -n '5p' file                    # 只打印第5行
sed -n '2,5p' file                  # 只打印第2到5行
sed -n '/pattern/p' file            # 只打印匹配行
```

### 2.3 文本排序和去重

#### sort - 排序文本
```bash
sort file.txt                       # 按字典序排序
sort -n file.txt                    # 按数值排序
sort -r file.txt                    # 逆序排序
sort -u file.txt                    # 排序并去重
sort -k 2 file.txt                  # 按第2列排序
sort -t: -k 3 -n /etc/passwd        # 指定分隔符，按第3列数值排序

# 实用示例
du -h | sort -hr                    # 按文件大小排序
ps aux | sort -k 3 -nr              # 按CPU使用率排序进程
```

#### uniq - 去除重复行
```bash
uniq file.txt                       # 去除相邻重复行
uniq -c file.txt                    # 显示重复次数
uniq -d file.txt                    # 只显示重复行
uniq -u file.txt                    # 只显示不重复行

# 通常与sort结合使用
sort file.txt | uniq                # 排序后去重
sort file.txt | uniq -c | sort -nr  # 统计重复次数并排序
```

#### wc - 统计文本
```bash
wc file.txt                         # 显示行数、单词数、字符数
wc -l file.txt                      # 只显示行数
wc -w file.txt                      # 只显示单词数
wc -c file.txt                      # 只显示字符数
wc -m file.txt                      # 只显示字符数（多字节字符）

# 实用示例
ls | wc -l                          # 统计当前目录文件数
ps aux | wc -l                      # 统计进程数
```

### 2.4 文本比较

#### diff - 比较文件差异
```bash
diff file1.txt file2.txt            # 比较两个文件
diff -u file1.txt file2.txt         # 统一格式显示差异
diff -c file1.txt file2.txt         # 上下文格式显示差异
diff -r dir1 dir2                   # 递归比较目录
diff -q file1.txt file2.txt         # 只显示是否不同

# 忽略差异
diff -i file1.txt file2.txt         # 忽略大小写
diff -w file1.txt file2.txt         # 忽略空白字符
diff -b file1.txt file2.txt         # 忽略空白字符数量变化
```

#### comm - 比较排序文件
```bash
comm file1.txt file2.txt            # 比较两个排序文件
comm -1 file1.txt file2.txt         # 不显示file1独有的行
comm -2 file1.txt file2.txt         # 不显示file2独有的行
comm -3 file1.txt file2.txt         # 不显示共同的行
comm -12 file1.txt file2.txt        # 只显示共同的行
```
## 三、系统信息和监控

### 3.1 系统信息查看

#### uname - 系统信息
```bash
uname                               # 显示系统名称
uname -a                            # 显示所有系统信息
uname -r                            # 显示内核版本
uname -m                            # 显示机器架构
uname -p                            # 显示处理器类型
uname -o                            # 显示操作系统
```

#### whoami/who/w - 用户信息
```bash
whoami                              # 显示当前用户名
who                                 # 显示当前登录用户
w                                   # 显示当前登录用户及其活动
id                                  # 显示用户和组ID
groups                              # 显示当前用户所属组
```

#### date - 日期和时间
```bash
date                                # 显示当前日期时间
date +"%Y-%m-%d %H:%M:%S"          # 自定义格式显示
date -d "yesterday"                 # 显示昨天日期
date -d "next week"                 # 显示下周日期
date -d "2023-12-31"               # 显示指定日期是星期几

# 设置系统时间（需要root权限）
sudo date -s "2023-12-31 12:00:00"
```

#### uptime - 系统运行时间
```bash
uptime                              # 显示系统运行时间和负载
uptime -p                           # 以易读格式显示运行时间
uptime -s                           # 显示系统启动时间
```

### 3.2 硬件和资源信息

#### df - 磁盘空间使用情况
```bash
df                                  # 显示文件系统磁盘使用情况
df -h                               # 人性化显示（KB, MB, GB）
df -T                               # 显示文件系统类型
df -i                               # 显示inode使用情况
df /path/to/directory               # 显示指定目录所在分区信息
```

#### du - 目录空间使用情况
```bash
du                                  # 显示当前目录及子目录大小
du -h                               # 人性化显示
du -s                               # 只显示总计
du -sh *                            # 显示当前目录下各项目大小
du -ah                              # 显示所有文件和目录大小
du -h --max-depth=1                 # 只显示一级子目录大小

# 实用示例
du -sh /var/log/*                   # 查看日志文件大小
du -h | sort -hr | head -10         # 显示最大的10个目录
```

#### free - 内存使用情况
```bash
free                                # 显示内存使用情况
free -h                             # 人性化显示
free -m                             # 以MB为单位显示
free -g                             # 以GB为单位显示
free -s 5                           # 每5秒刷新一次
```

#### lscpu - CPU信息
```bash
lscpu                               # 显示CPU详细信息
cat /proc/cpuinfo                   # 查看CPU详细信息
nproc                               # 显示CPU核心数
```

#### lsblk - 块设备信息
```bash
lsblk                               # 以树形显示块设备
lsblk -f                            # 显示文件系统信息
lsblk -m                            # 显示权限信息
```

#### lsusb/lspci - USB和PCI设备
```bash
lsusb                               # 列出USB设备
lspci                               # 列出PCI设备
lspci -v                            # 详细信息
```

### 3.3 进程管理

#### ps - 查看进程
```bash
ps                                  # 显示当前终端进程
ps aux                              # 显示所有进程详细信息
ps -ef                              # 显示所有进程（另一种格式）
ps -u username                      # 显示指定用户的进程
ps -C process_name                  # 显示指定名称的进程

# 常用组合
ps aux | grep process_name          # 查找特定进程
ps aux --sort=-%cpu | head          # 按CPU使用率排序
ps aux --sort=-%mem | head          # 按内存使用率排序
```

#### top/htop - 实时进程监控
```bash
top                                 # 实时显示进程信息
htop                                # 更友好的进程监控工具

# top 常用快捷键
# P：按CPU使用率排序
# M：按内存使用率排序
# T：按运行时间排序
# k：杀死进程
# r：改变进程优先级
# q：退出
```

#### kill - 终止进程
```bash
kill PID                            # 终止指定PID的进程
kill -9 PID                         # 强制终止进程
kill -15 PID                        # 优雅终止进程（默认）
kill -l                             # 列出所有信号

killall process_name                # 终止所有同名进程
killall -9 process_name             # 强制终止所有同名进程
pkill process_name                  # 按名称终止进程
pkill -u username                   # 终止指定用户的所有进程
```

#### jobs/bg/fg - 作业控制
```bash
jobs                                # 显示当前作业
bg                                  # 将作业放到后台运行
fg                                  # 将作业调到前台运行
fg %1                               # 将作业1调到前台

# 启动后台进程
command &                           # 直接在后台运行
nohup command &                     # 后台运行，忽略挂起信号

# 快捷键
# Ctrl+Z：暂停当前进程
# Ctrl+C：终止当前进程
```

#### nohup - 忽略挂起信号运行命令
```bash
nohup command                       # 忽略挂起信号运行
nohup command > output.log 2>&1 &   # 后台运行并重定向输出
```

### 3.4 系统监控工具

#### iostat - I/O统计
```bash
iostat                              # 显示CPU和I/O统计
iostat -x                           # 显示扩展统计
iostat 2                            # 每2秒刷新一次
iostat -x 2 5                       # 每2秒刷新，共5次
```

#### vmstat - 虚拟内存统计
```bash
vmstat                              # 显示系统统计信息
vmstat 2                            # 每2秒刷新一次
vmstat 2 5                          # 每2秒刷新，共5次
```

#### sar - 系统活动报告
```bash
sar -u                              # CPU使用率
sar -r                              # 内存使用情况
sar -d                              # 磁盘活动
sar -n DEV                          # 网络统计
sar -q                              # 队列长度和负载平均值
```

#### netstat - 网络连接状态
```bash
netstat -a                          # 显示所有连接
netstat -t                          # 显示TCP连接
netstat -u                          # 显示UDP连接
netstat -l                          # 显示监听端口
netstat -p                          # 显示进程信息
netstat -r                          # 显示路由表

# 常用组合
netstat -tlnp                       # 显示TCP监听端口和进程
netstat -an | grep :80              # 查看80端口连接
```

#### ss - 现代的netstat替代品
```bash
ss -a                               # 显示所有连接
ss -t                               # 显示TCP连接
ss -l                               # 显示监听端口
ss -p                               # 显示进程信息
ss -s                               # 显示统计信息

# 常用组合
ss -tlnp                            # 显示TCP监听端口和进程
ss -an | grep :80                   # 查看80端口连接
```
## 四、网络命令

### 4.1 网络连接和测试

#### ping - 测试网络连通性
```bash
ping google.com                     # 持续ping
ping -c 4 google.com                # ping 4次后停止
ping -i 2 google.com                # 每2秒ping一次
ping -s 1000 google.com             # 指定数据包大小
ping -f google.com                  # 洪水ping（需要root权限）
```

#### wget - 下载文件
```bash
wget http://example.com/file.zip    # 下载文件
wget -O newname.zip http://...      # 指定保存文件名
wget -c http://example.com/file.zip # 断点续传
wget -r http://example.com/         # 递归下载整个网站
wget -b http://example.com/file.zip # 后台下载
wget --limit-rate=200k http://...   # 限制下载速度
```

#### curl - 数据传输工具
```bash
curl http://example.com             # 获取网页内容
curl -o file.html http://...        # 保存到文件
curl -O http://example.com/file.zip # 使用远程文件名保存
curl -L http://example.com          # 跟随重定向
curl -I http://example.com          # 只获取HTTP头信息
curl -X POST http://api.example.com # 发送POST请求
curl -d "data=value" http://...     # 发送POST数据
curl -H ": application/json" http://... # 设置请求头
```

#### traceroute - 跟踪网络路径
```bash
traceroute google.com               # 跟踪到目标的网络路径
traceroute -n google.com            # 不解析主机名
traceroute -m 15 google.com         # 设置最大跳数
```

#### nslookup/dig - DNS查询
```bash
nslookup google.com                 # DNS查询
nslookup google.com 8.8.8.8         # 使用指定DNS服务器查询

dig google.com                      # 更详细的DNS查询
dig @8.8.8.8 google.com             # 使用指定DNS服务器
dig google.com MX                   # 查询MX记录
dig google.com NS                   # 查询NS记录
dig +short google.com               # 简短输出
```

### 4.2 网络配置

#### ifconfig - 网络接口配置（传统）
```bash
ifconfig                            # 显示所有网络接口
ifconfig eth0                       # 显示指定接口
ifconfig eth0 up                    # 启用接口
ifconfig eth0 down                  # 禁用接口
ifconfig eth0 192.168.1.100         # 设置IP地址
```

#### ip - 现代网络配置工具
```bash
ip addr show                        # 显示所有接口地址
ip addr show eth0                   # 显示指定接口
ip link show                        # 显示网络接口
ip route show                       # 显示路由表
ip route add default via 192.168.1.1 # 添加默认路由
```

#### route - 路由表管理
```bash
route -n                            # 显示路由表
route add default gw 192.168.1.1    # 添加默认网关
route del default                   # 删除默认路由
```

## 五、文件权限和用户管理

### 5.1 文件权限

#### chmod - 修改文件权限
```bash
# 数字方式
chmod 755 file.txt                  # rwxr-xr-x
chmod 644 file.txt                  # rw-r--r--
chmod 600 file.txt                  # rw-------
chmod 777 file.txt                  # rwxrwxrwx（不推荐）

# 符号方式
chmod u+x file.txt                  # 给用户添加执行权限
chmod g-w file.txt                  # 移除组写权限
chmod o=r file.txt                  # 设置其他用户只读
chmod a+r file.txt                  # 给所有用户添加读权限

# 递归修改
chmod -R 755 directory              # 递归修改目录权限

# 权限数字含义：
# 4 = 读权限 (r)
# 2 = 写权限 (w)  
# 1 = 执行权限 (x)
# 7 = 4+2+1 = rwx
# 6 = 4+2 = rw-
# 5 = 4+1 = r-x
```

#### chown - 修改文件所有者
```bash
chown user file.txt                 # 修改文件所有者
chown user:group file.txt           # 修改所有者和组
chown :group file.txt               # 只修改组
chown -R user:group directory       # 递归修改目录

# 实用示例
sudo chown www-data:www-data /var/www/html
sudo chown -R $USER:$USER ~/myproject
```

#### chgrp - 修改文件所属组
```bash
chgrp group file.txt                # 修改文件所属组
chgrp -R group directory            # 递归修改目录所属组
```

#### umask - 设置默认权限
```bash
umask                               # 显示当前umask值
umask 022                           # 设置umask值
umask -S                            # 以符号形式显示

# umask计算：
# 文件默认权限 = 666 - umask
# 目录默认权限 = 777 - umask
```

### 5.2 用户管理

#### su - 切换用户
```bash
su                                  # 切换到root用户
su username                         # 切换到指定用户
su - username                       # 切换用户并加载环境变量
su -c "command" username            # 以指定用户身份执行命令
```

#### sudo - 以其他用户身份执行命令
```bash
sudo command                        # 以root身份执行命令
sudo -u username command            # 以指定用户身份执行
sudo -l                             # 列出当前用户可执行的sudo命令
sudo -s                             # 启动shell
sudo -i                             # 启动登录shell
```

#### passwd - 修改密码
```bash
passwd                              # 修改当前用户密码
sudo passwd username                # 修改指定用户密码
passwd -l username                  # 锁定用户账户
passwd -u username                  # 解锁用户账户
passwd -d username                  # 删除用户密码
```

#### useradd/userdel - 用户管理
```bash
# 添加用户
sudo useradd username               # 添加用户
sudo useradd -m username            # 添加用户并创建家目录
sudo useradd -m -s /bin/bash username # 指定shell
sudo useradd -m -G sudo username    # 添加到sudo组

# 删除用户
sudo userdel username               # 删除用户
sudo userdel -r username            # 删除用户及其家目录
```

#### usermod - 修改用户
```bash
sudo usermod -aG group username     # 添加用户到组
sudo usermod -s /bin/zsh username   # 修改用户shell
sudo usermod -l newname oldname     # 修改用户名
sudo usermod -L username            # 锁定用户
sudo usermod -U username            # 解锁用户
```

#### groups/id - 查看用户信息
```bash
groups                              # 显示当前用户所属组
groups username                     # 显示指定用户所属组
id                                  # 显示用户和组ID
id username                         # 显示指定用户信息
```

## 六、压缩和归档

### 6.1 tar - 归档工具
```bash
# 创建归档
tar -cf archive.tar file1 file2    # 创建tar归档
tar -czf archive.tar.gz directory  # 创建gzip压缩归档
tar -cjf archive.tar.bz2 directory # 创建bzip2压缩归档
tar -cJf archive.tar.xz directory  # 创建xz压缩归档

# 查看归档内容
tar -tf archive.tar                # 列出归档内容
tar -tzf archive.tar.gz            # 列出gzip归档内容

# 提取归档
tar -xf archive.tar                # 提取tar归档
tar -xzf archive.tar.gz            # 提取gzip归档
tar -xjf archive.tar.bz2           # 提取bzip2归档
tar -xf archive.tar -C /path/to/dir # 提取到指定目录

# 常用选项
tar -czf backup.tar.gz --exclude='*.log' /home/user # 排除特定文件
tar -xzf archive.tar.gz file.txt   # 只提取特定文件
tar -czf - directory | ssh user@host 'tar -xzf -' # 通过SSH传输
```

### 6.2 压缩工具

#### gzip/gunzip - gzip压缩
```bash
gzip file.txt                       # 压缩文件（原文件被删除）
gzip -k file.txt                    # 压缩文件（保留原文件）
gzip -r directory                   # 递归压缩目录中的文件
gunzip file.txt.gz                  # 解压文件
gzip -d file.txt.gz                 # 解压文件（同gunzip）
gzip -l file.txt.gz                 # 显示压缩信息
```

#### zip/unzip - zip压缩
```bash
zip archive.zip file1 file2        # 创建zip文件
zip -r archive.zip directory       # 递归压缩目录
zip -e archive.zip file.txt        # 创建加密zip文件

unzip archive.zip                   # 解压zip文件
unzip archive.zip -d /path/to/dir   # 解压到指定目录
unzip -l archive.zip                # 列出zip文件内容
unzip -t archive.zip                # 测试zip文件完整性
```

#### 7z - 7-Zip压缩
```bash
7z a archive.7z file1 file2        # 创建7z归档
7z a -r archive.7z directory       # 递归添加目录
7z x archive.7z                     # 提取7z归档
7z l archive.7z                     # 列出归档内容
7z t archive.7z                     # 测试归档完整性
```
## 七、环境变量和Shell

### 7.1 环境变量

#### export - 设置环境变
```bash
export VAR_NAME="value"             # 设置环境变量
export PATH=$PATH:/new/path         # 添加到PATH
export -p                           # 显示所有环境变量
unset VAR_NAME                      # 删除环境变量
```

#### env - 环境变量管理
```bash
env                                 # 显示所有环境变量
env VAR=value command               # 临时设置环境变量运行命令
env -i command                      # 清空环境变量运行命令
env -u VAR command                  # 删除指定环境变量运行命令
```

#### 常用环境变量
```bash
echo $HOME                          # 用户家目录
echo $PATH                          # 可执行文件搜索路径
echo $USER                          # 当前用户名
echo $SHELL                         # 当前shell
echo $PWD                           # 当前工作目录
echo $OLDPWD                        # 上一个工作目录
echo $PS1                           # 命令提示符格式
```

### 7.2 Shell配置文件

#### 配置文件位置
```bash
~/.bashrc                           # bash用户配置文件
~/.bash_profile                     # bash登录配置文件
~/.profile                          # 通用配置文件
/etc/bash.bashrc                    # 系统级bash配置
/etc/profile                        # 系统级配置文件

# 重新加载配置文件
source ~/.bashrc                    # 或者使用 . ~/.bashrc
```

#### 别名设置
```bash
alias ll='ls -la'                   # 设置别名
alias grep='grep --color=auto'      # 带颜色的grep
alias ..='cd ..'                    # 快速返回上级目录
alias ...='cd ../..'                # 快速返回上两级目录

unalias ll                          # 删除别名
alias                               # 显示所有别名
```

### 7.3 历史命令

#### history - 命令历史
```bash
history                             # 显示命令历史
history 10                          # 显示最近10条命令
history -c                          # 清空历史记录
history -d 100                      # 删除第100条历史记录

# 历史命令快捷键
!!                                  # 执行上一条命令
!n                                  # 执行第n条历史命令
!string                             # 执行最近以string开头的命令
!?string                            # 执行最近包含string的命令

# Ctrl+R：反向搜索历史命令
# Ctrl+P：上一条命令
# Ctrl+N：下一条命令
```

## 八、管道和重定向

### 8.1 重定向操作符

#### 输出重定向
```bash
command > file                      # 重定向标准输出到文件（覆盖）
command >> file                     # 重定向标准输出到文件（追加）
command 2> file                     # 重定向标准错误到文件
command 2>> file                    # 重定向标准错误到文件（追加）
command > file 2>&1                 # 重定向标准输出和错误到同一文件
command &> file                     # 同上（bash简写）
command > /dev/null 2>&1            # 丢弃所有输出
```

#### 输入重定向
```bash
command < file                      # 从文件读取输入
command << EOF                      # Here文档
This is input
EOF

command <<< "string"                # Here字符串
```

### 8.2 管道操作

#### 基本管道
```bash
command1 | command2                 # 将command1的输出作为command2的输入
command1 | command2 | command3      # 多级管道

# 实用示例
ps aux | grep nginx                 # 查找nginx进程
ls -la | grep "^d"                  # 只显示目录
cat /var/log/syslog | tail -100 | grep error # 查看最近100行中的错误
```

#### tee - 分流输出
```bash
command | tee file.txt              # 输出到屏幕同时保存到文件
command | tee -a file.txt           # 追加到文件
command | tee file1.txt file2.txt   # 同时保存到多个文件
```

#### xargs - 参数传递
```bash
find . -name "*.txt" | xargs rm     # 删除所有txt文件
echo "file1 file2 file3" | xargs ls -l # 对每个文件执行ls -l
find . -name "*.log" | xargs -I {} cp {} /backup/ # 复制所有log文件

# 常用选项
find . -name "*.txt" | xargs -n 1 echo # 每次处理一个参数
find . -name "*.txt" | xargs -P 4 process # 并行处理（4个进程）
```

## 九、高级技巧和实用命令

### 9.1 文本处理高级技巧

#### 组合命令示例
```bash
# 统计代码行数
find . -name "*.py" | xargs wc -l | tail -1

# 查找最大的文件
find . -type f -exec ls -la {} \; | sort -k 5 -nr | head -10

# 批量重命名文件
for file in *.txt; do mv "$file" "${file%.txt}.bak"; done

# 查找并替换文件内容
find . -name "*.txt" -exec sed -i 's/old/new/g' {} \;

# 统计目录中文件类型
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -nr

# 查找重复文件
find . -type f -exec md5sum {} \; | sort | uniq -d -w 32
```

### 9.2 系统维护命令

#### crontab - 定时任务
```bash
crontab -e                          # 编辑当前用户的定时任务
crontab -l                          # 列出当前用户的定时任务
crontab -r                          # 删除当前用户的所有定时任务
sudo crontab -u username -e         # 编辑指定用户的定时任务

# crontab格式：分 时 日 月 周 命令
# 示例：
# 0 2 * * * /path/to/backup.sh     # 每天凌晨2点执行备份
# */5 * * * * /path/to/check.sh    # 每5分钟执行检查
# 0 0 1 * * /path/to/monthly.sh    # 每月1号执行
```

#### systemctl - 系统服务管理
```bash
systemctl status service_name       # 查看服务状态
systemctl start service_name        # 启动服务
systemctl stop service_name         # 停止服务
systemctl restart service_name      # 重启服务
systemctl reload service_name       # 重新加载配置
systemctl enable service_name       # 设置开机自启
systemctl disable service_name      # 禁用开机自启
systemctl list-units --type=service # 列出所有服务
```

#### journalctl - 系统日志
```bash
journalctl                          # 查看所有日志
journalctl -u service_name          # 查看指定服务日志
journalctl -f                       # 实时跟踪日志
journalctl --since "2023-12-01"     # 查看指定日期后的日志
journalctl --until "2023-12-31"     # 查看指定日期前的日志
journalctl -p err                   # 只显示错误级别日志
journalctl --disk-usage             # 显示日志占用空间
journalctl --vacuum-time=7d         # 清理7天前的日志
```

### 9.3 快捷键和技巧

#### Bash快捷键
```bash
# 光标移动
Ctrl+A                              # 移动到行首
Ctrl+E                              # 移动到行尾
Ctrl+F                              # 向前移动一个字符
Ctrl+B                              # 向后移动一个字符
Alt+F                               # 向前移动一个单词
Alt+B                               # 向后移动一个单词

# 编辑
Ctrl+U                              # 删除光标前的所有字符
Ctrl+K                              # 删除光标后的所有字符
Ctrl+W                              # 删除光标前的一个单词
Alt+D                               # 删除光标后的一个单词
Ctrl+Y                              # 粘贴最近删除的内容

# 历史
Ctrl+R                              # 反向搜索历史命令
Ctrl+P                              # 上一条命令
Ctrl+N                              # 下一条命令

# 控制
Ctrl+C                              # 终止当前命令
Ctrl+Z                              # 暂停当前命令
Ctrl+D                              # 退出当前shell或发送EOF
Ctrl+L                              # 清屏
```

#### 通配符和正则表达式
```bash
# 通配符
*                                   # 匹配任意字符
?                                   # 匹配单个字符
[abc]                               # 匹配a、b或c
[a-z]                               # 匹配小写字母
[!abc]                              # 不匹配a、b、c
{txt,log}                           # 匹配txt或log

# 示例
ls *.txt                            # 列出所有txt文件
rm file?.log                        # 删除file1.log, file2.log等
cp *.{txt,log} /backup/             # 复制所有txt和log文件
```

### 9.4 实用脚本示例

#### 系统信息脚本
```bash
#!/bin/bash
# system_info.sh

echo "=== 系统信息 ==="
echo "主机名: $(hostname)"
echo "操作系统: $(uname -o)"
echo "内核版本: $(uname -r)"
echo "CPU架构: $(uname -m)"
echo "运行时间: $(uptime -p)"
echo

echo "=== CPU信息 ==="
echo "CPU核心数: $(nproc)"
echo "CPU使用率: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
echo

echo "=== 内存信息 ==="
free -h
echo

echo "=== 磁盘使用情况 ==="
df -h
echo

echo "=== 网络接口 ==="
ip addr show | grep -E "^[0-9]+:|inet "
```

#### 日志分析脚本
```bash
#!/bin/bash
# log_analysis.sh

LOG_FILE="/var/log/nginx/access.log"

echo "=== 访问量统计 ==="
echo "总访问量: $(wc -l < $LOG_FILE)"
echo "今日访问量: $(grep "$(date '+%d/%b/%Y')" $LOG_FILE | wc -l)"
echo

echo "=== 热门页面 TOP 10 ==="
awk '{print $7}' $LOG_FILE | sort | uniq -c | sort -nr | head -10
echo

echo "=== 访问IP TOP 10 ==="
awk '{print $1}' $LOG_FILE | sort | uniq -c | sort -nr | head -10
echo

echo "=== HTTP状态码统计 ==="
awk '{print $9}' $LOG_FILE | sort | uniq -c | sort -nr
```

## 十、总结

Linux命令行是系统管理和开发工作的强大工具。通过本文的学习，你应该掌握了：

### 核心技能
1. **文件操作**：创建、复制、移动、删除文件和目录
2. **文本处理**：查看、搜索、编辑、分析文本内容
3. **系统监控**：查看系统资源使用情况和进程状态
4. **网络管理**：网络连接测试和配置
5. **权限管理**：文件权限和用户管理
6. **数据处理**：压缩、归档、管道和重定向

### 学习建议
- **多练习**：命令行技能需要大量实践才能熟练
- **组合使用**：学会将多个命令组合使用解决复杂问题
- **阅读手册**：使用`man command`查看详细帮助
- **安全意识**：特别注意`rm -rf`等危险命令的使用
- **脚本编写**：将常用操作写成脚本提高效率

### 进阶方向
- **Shell脚本编程**：学习bash脚本编写
- **正则表达式**：掌握复杂的文本匹配模式
- **系统管理**：深入学习系统服务和配置管理
- **自动化运维**：使用工具如Ansible、Docker等

记住，Linux命令行的学习是一个持续的过程。随着经验的积累，你会发现更多高效的使用技巧和最佳实践。保持好奇心，多实验，多总结，你会成为命令行高手！
