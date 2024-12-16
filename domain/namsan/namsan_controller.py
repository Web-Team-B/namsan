from flask import Blueprint, render_template, send_from_directory, jsonify
import pandas as pd

bp = Blueprint("namsan", __name__, url_prefix="/api/namsan",template_folder="templates",static_folder="static")


@bp.route("/test", methods=["GET"])
def test():
    return {"message": "Namsan Test Successful"}, 200


@bp.route("/page", methods=["GET"])
def namsan_page():
    return render_template("namsan.html")


@bp.route("/api/traffic_data<file_index>")
def get_data(file_index):
    files = [
        "domain/namsan/data/namsan1_45_traffic_avg.csv",
        "domain/namsan/data/namsan1_45_speed_avg.csv",
        "domain/namsan/data/jangchundanro_45_traffic_avg.csv",
        "domain/namsan/data/jangchundanro_45_speed_avg.csv",
        "domain/namsan/data/namsan1_6_traffic_avg.csv",
        "domain/namsan/data/namsan1_6_speed_avg.csv",
        "domain/namsan/data/jangchundanro_6_traffic_avg.csv",
        "domain/namsan/data/jangchundanro_6_speed_avg.csv"
    ]

    # 파일 인덱스를 기반으로 데이터 읽기
    file_path = files[int(file_index) - 1]
    df = pd.read_csv(file_path, header=0, index_col=0)

    # JSON 데이터 변환
    data = [{"time": str(column).strip(), "value": float(df[column].values[0])} for column in df.columns]



    return jsonify(data)

