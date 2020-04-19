from uuid import uuid4
from datetime import datetime, timedelta
from werkzeug.datastructures import CallbackDict

import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
from flask import Flask,render_template, jsonify, request, session, make_response
from flask.sessions import SessionInterface, SessionMixin


class MongoSession(CallbackDict, SessionMixin):
    def __init__(self, initial=None, sid=None):
        CallbackDict.__init__(self, initial)
        self.sid = sid
        self.modified = False


class MongoSessinoInterface(SessionInterface):
    def __init__(self, host='localhost', port=27017,\
                db='', collection='sessions'):
        client = MongoClient(host, port)
        self.store = client[db][collection]

    def open_session(self, app, request):
        sid = request.cookies.get(app.session_cookie_name)
        if sid:
            stored_session = self.store.find_one({'sid': sid})
            if stored_session:
                if stored_session.get('expiration') > datetime.utcnow():
                    return MongoSession(initial=stored_session['data'],
                                        sid=stored_session['sid'])
        sid = str(uuid4())
        return MongoSession(sid=sid)

    def save_session(self, app, session, response):
        domain = self.get_cookie_domain(app)
        if session is None:
            response.delete_cookie(app.session_cookie_name, domain=domain)
            return
        if  self.get_expiration_time(app, session):
            expiration = self.get_expiration_time(app, session)
        else:
            expiration = datetime.utcnow() +  timedelta(days=30)
        self.store.update({'sid': session.sid}, {
                            'sid': session.sid,
                            'data': session,
                            'expiration': expiration
                        }, True)
        response.set_cookie(app.session_cookie_name,
                            session.sid,
                            expires=self.get_expiration_time(app, session),
                            httponly=True, domain=domain)


app = Flask(__name__)
app.session_interface = MongoSessinoInterface(db='session')
app.config.update(
    SESSION_COOKIE_NAME='flask_session'
)

client = MongoClient('localhost', 27017)
db = client.myshopping


# @app.route('/session_in')
# def session_signin():
#     print(session.sid)
#     session['test'] = 'abc'
#     return 'Login'


# @app.route('/session_out')
# def session_signout():
#     session.clear()
#     return "Signout"


@app.route('/search', methods=['POST'])
def search():
    url = request.form['url']
    headers = {'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}
    data = requests.get(url, headers=headers)
    # musinsa_data = request.get(musinsaUrl,headers=headers)
    
    # HTML을 BeautifulSoup이라는 라이브러리를 활용해 검색하기 용이한 상태로 만듦
    soup = BeautifulSoup(data.text, 'html.parser')

    # select를 이용해서, tr들을 불러오기
    items = soup.select('#sch_product>div>ul>li')

    products = []
    # items (li들) 의 반복문을 돌리기
    for item in items:
        brdName= item.select_one('a>div>div>div.brand').text
        prdName = item.select_one('a>div>div>div.product').text
        prdPrice = item.select_one('a>div>div>span.discount_price').text
        imgUrl=item.select_one('a>div>img')['src']
        prdUrl=item.select_one('a')['href']
        data={
            'brdName':brdName,
            'prdName': prdName,
            'prdPrice': prdPrice,
            'imgUrl': imgUrl,
            'prdUrl':url+prdUrl
        }
        products.append(data)
    
    return jsonify({'result': 'success', 'data':products})


@app.route('/musinsaSearch')
def musinsaSearch():
    url = request.form['url']
    headers = {'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}
    data = requests.get(url, headers=headers)
    soup = BeautifulSoup(data.text, 'html.parser')

    # select를 이용해서, tr들을 불러오기
    items = soup.select('#searchList>li>div')

    products = []
    # items (li들) 의 반복문을 돌리기
    for item in items:
        brdName= item.select_one('div>p.item_title>a').text
        prdName = item.select_one('div>p.list_info>a').text
        prdPrice = item.select_one('div>p.price').text
        imgUrl=item.select_one('div>a>img')['src']
        prdUrl=item.select_one('div>a')['href']
        data={
            'brdName':brdName,
            'prdName': prdName,
            'prdPrice': prdPrice,
            'imgUrl': imgUrl,
            'prdUrl':url+prdUrl
        }
        products.append(data)
    
    return jsonify({'result': 'success', 'data':products})


@app.route('/like', methods=['POST'])
def like():
    
    session_id = session.sid
    prd_url = request.form['prd_url']

    db.prdlike.insert_one({
        'prd_url':prd_url,
        'session_id':session_id
    })

    return jsonify({'result': 'success', 'msg': '찜 완료!'})


@app.route('/likeList')
def likeList():
    session_id = session.sid
    likePrd_url = list(db.prdlike.find({'session_id':session_id}, {'_id':False, 'session_id':False}))

    if likePrd_url is not None:

        products = []
        for url in likePrd_url:
            headers = {'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}
            data = requests.get(url, headers=headers)
            # musinsa_data = request.get(musinsaUrl,headers=headers)
            
            soup = BeautifulSoup(data.text, 'html.parser')

            url = soup.select('#frmproduct>div')

            brdName= url.select_one('h2').text
            prdName = url.select_one('h3').text
            prdPrice = url.select_one('dl>dd>>em').text

            data={
                'brdName':brdName,
                'prdName': prdName,
                'prdPrice': prdPrice,
                'prdUrl':likePrd_url
            }
            
            products.append(data)
        print(products)

    return jsonify({'result': 'success', 'data':products})


@app.route('/')
def home():
    resp = make_response(render_template('list.html'))
    resp.set_cookie(app.session_cookie_name, session.sid)
    return resp

@app.route('/mypage')
def mypage():
    return render_template('mypage.html')


if __name__=="__main__":
    app.run('localhost', 5001, debug=True)
