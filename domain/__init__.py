from flask import Flask, jsonify


def create_app():
    app = Flask(__name__)

    # api들 등록 예시
    # from .users import user_controller
    # app.register_blueprint(user_controller.bp)

    from .gangnam import gangnam_controller
    app.register_blueprint(gangnam_controller.bp)

    from .namsan import namsan_controller
    app.register_blueprint(namsan_controller.bp)

    return app