# Flask API Backend

This is the API backend for the Solid-Flask web application template.
It is based on [Flask](https://flask.palletsprojects.com/en/stable/) and [SQLAlchemy](https://www.sqlalchemy.org/).
For the rest of the dependencies, see `requirements.txt`.

## Installation

### Local Development

```bash
make deps
make fixtures
make server
```

## Configuration

The API can be configured using environment variables, all present in `app/config.py`:

## Testing

```bash
make test
make test_cov
```

## Versions

- (Python)[https://www.python.org/] 3.13
