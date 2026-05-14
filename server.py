import os
import sys
from flask import Flask, render_template, send_from_directory, request, jsonify

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'dist'

@app.route('/')
def index():
    """
    主页路由，显示文件列表
    """
    base_path = app.config['UPLOAD_FOLDER']
    path = request.args.get('path', '')
    full_path = os.path.join(base_path, path)
    
    if not os.path.exists(full_path):
        return "路径不存在", 404
    
    files = []
    dirs = []
    
    for item in os.listdir(full_path):
        item_path = os.path.join(full_path, item)
        relative_path = os.path.join(path, item)
        
        if os.path.isdir(item_path):
            dirs.append({
                'name': item,
                'path': relative_path,
                'type': 'directory'
            })
        else:
            _, ext = os.path.splitext(item)
            file_type = get_file_type(ext.lower())
            files.append({
                'name': item,
                'path': relative_path,
                'type': file_type,
                'size': format_size(os.path.getsize(item_path))
            })
    
    dirs.sort(key=lambda x: x['name'].lower())
    files.sort(key=lambda x: x['name'].lower())
    
    parent_path = os.path.dirname(path) if path else None
    
    return render_template('index.html', 
                         dirs=dirs, 
                         files=files, 
                         current_path=path,
                         parent_path=parent_path)

def get_file_type(ext):
    """
    根据文件扩展名判断文件类型
    """
    video_extensions = ['.mp4', '.webm', '.ogg', '.mkv', '.mov', '.avi', '.flv']
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg']
    audio_extensions = ['.mp3', '.wav', '.ogg', '.flac']
    pdf_extensions = ['.pdf']
    
    if ext in video_extensions:
        return 'video'
    elif ext in image_extensions:
        return 'image'
    elif ext in audio_extensions:
        return 'audio'
    elif ext in pdf_extensions:
        return 'pdf'
    else:
        return 'other'

def format_size(bytes_size):
    """
    格式化文件大小为可读格式
    """
    if bytes_size < 1024:
        return f"{bytes_size} B"
    elif bytes_size < 1024 * 1024:
        return f"{bytes_size / 1024:.2f} KB"
    else:
        return f"{bytes_size / (1024 * 1024):.2f} MB"

@app.route('/files/<path:file_path>')
def serve_file(file_path):
    """
    提供文件下载服务
    """
    base_path = app.config['UPLOAD_FOLDER']
    full_path = os.path.join(base_path, file_path)
    
    if not os.path.exists(full_path):
        return "文件不存在", 404
    
    directory = os.path.dirname(full_path)
    filename = os.path.basename(full_path)
    
    return send_from_directory(directory, filename, as_attachment=False)

@app.route('/api/server/status')
def server_status():
    """
    获取服务器状态信息
    """
    return jsonify({
        'status': 'running',
        'version': '1.0.0',
        'upload_folder': app.config['UPLOAD_FOLDER']
    })

@app.route('/api/server/shutdown', methods=['POST'])
def shutdown_server():
    """
    关闭服务器（仅开发环境使用）
    """
    func = request.environ.get('werkzeug.server.shutdown')
    if func:
        func()
        return jsonify({'message': '服务器已关闭'})
    return jsonify({'message': '无法关闭服务器'}), 500

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    print(f"服务器启动在 http://localhost:{port}")
    print("按 Ctrl+C 停止服务器")
    app.run(host='0.0.0.0', port=port, debug=True)