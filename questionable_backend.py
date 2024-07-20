from flask import Flask 
from flask import render_template

app = Flask(__name__)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('./unfinished.html'), 404