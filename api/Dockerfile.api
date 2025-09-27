FROM python:3.13

RUN useradd --create-home my-solid-app
USER my-solid-app

WORKDIR /home/my-solid-app

RUN python -m venv venv
ENV PATH="/home/my-solid-app/venv/bin:$PATH"

COPY --chown=my-solid-app requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY --chown=my-solid-app . .

EXPOSE 5000

CMD ["gunicorn", "--log-level", "debug", "-w", "4", "-b", "0.0.0.0:5000", "server:app"]
