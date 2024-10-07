from app.extensions import ModelBase


def update_model(model: ModelBase, data: dict):
    for key, value in data.items():
        setattr(model, key, value)
