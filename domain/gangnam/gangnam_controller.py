from flask import Blueprint


bp = Blueprint("강남", __name__, url_prefix="/api/gangnam")


@bp.route("/test", methods=["GET"])
def test():
    return {"message": "Test SuccessFull"}, 200