from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp

app = Flask(__name__)
CORS(app)

def get_video_info(url):
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

        seen_res = set()
        video_formats = []
        audio_candidates = []

        for f in info.get("formats", []):
            ext = f.get("ext")
            proto = f.get("protocol", "")
            # VIDEO formats (any extension, not just mp4)
            if (
                f.get("height") and
                f.get("vcodec") != "none" and
                proto not in ["m3u8_native", "m3u8", "dash"] and
                f.get("url")
            ):
                res = f["height"]
                if res not in seen_res:
                    seen_res.add(res)
                    size_mb = round(f.get("filesize", 0) / (1024 * 1024), 2) if f.get("filesize") else "Unknown"
                    video_formats.append({
                        "resolution": f"{res}p",
                        "url": f["url"],
                        "size": f"{size_mb} MB",
                        "ext": ext
                    })

            # AUDIO formats (any extension, not just mp3/m4a)
            if (
                f.get("acodec") != "none" and
                f.get("vcodec") == "none" and
                proto not in ["m3u8_native", "m3u8", "dash"] and
                f.get("url")
            ):
                size_mb = round(f.get("filesize", 0) / (1024 * 1024), 2) if f.get("filesize") else "Unknown"
                audio_candidates.append({
                    "ext": ext,
                    "url": f["url"],
                    "size": f"{size_mb} MB"
                })

        # Pick largest audio by size
        audio_candidates.sort(
            key=lambda x: float(x["size"].split()[0]) if x["size"] != "Unknown" else 0,
            reverse=True
        )
        best_audio = audio_candidates[0] if audio_candidates else None

        return {
            "title": info.get("title"),
            "duration": f"{info.get('duration', 0)//60:02}:{info.get('duration', 0)%60:02}",
            "thumbnail": info.get("thumbnail"),
            "audio": best_audio,
            "video": video_formats,
        }

@app.route("/api/video-info", methods=["POST"])
def video_info():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "URL is required"}), 400

    try:
        video_data = get_video_info(url)
        return jsonify(video_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/download/audio", methods=["GET"])
def download_audio():
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "URL is required"}), 400

    try:
        info = get_video_info(url)
        if not info["audio"]:
            return jsonify({"error": "No audio format found"}), 404
        return jsonify({"audio_url": info["audio"]["url"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/download/video", methods=["GET"])
def download_video():
    url = request.args.get("url")
    res = request.args.get("res")
    if not url or not res:
        return jsonify({"error": "URL and resolution are required"}), 400

    try:
        info = get_video_info(url)
        for v in info["video"]:
            if v["resolution"] == res:
                return jsonify({"video_url": v["url"]})
        return jsonify({"error": "Resolution not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
