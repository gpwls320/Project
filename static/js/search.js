$(document).ready(function() {
    // $('#nav-tab a').click(function(e) {
    //     alert(e)
    //     e.preventDefault();
    // });

    var param = document.location.href.split("?")[1];
    if (param !== "undefined") {
        temp = param.split("=")[1];
        search(temp)
    }

    $('#nav-wconcept-tab').click(function() {
        search()
    })

    $('#nav-musinsa-tab').click(function() {
        musinsaSearch(temp)
    })

    $("#wrap-loading").hide();
    $(document).ajaxStart(function() {
        $("#wrap-loading").show();
    }).ajaxStop(function() {
        $("#wrap-loading").hide();
    })
});

function prd_like(siteName, prdUrl) {
    $.ajax({
        type: "POST",
        url: "/like",
        data: {
            'site_name': siteName,
            'prd_url': prdUrl
        },
        success: function(response) {
            if (response['result'] == 'fail') {
                // 2. '좋아요 완료!' 얼럿을 띄웁니다.
                alert('이미 찜한 상품입니다.')
            } else {
                alert('찜하기 완료!')
            }
        }
    });
}

function prd_unlike(productId) {
    $.ajax({
        type: "POST",
        url: '/unlike',
        data: {
            "product_id": productId
        },
        success: function(response) {
            if (response['result'] == 'success') {
                alert('찜 해제 완료!')
                window.location.reload()
            }
        }
    })
}

function searchList() {
    const keyword = $("#keyword").val();
    console.log(keyword)
    location.href = "/list?q=" + encodeURI(keyword);
}

function enterkey() {
    if (window.event.keyCode == 13) {
        // 엔터키가 눌렸을 때 실행할 내용
        search(temp);
    }
}

function search(temp) {

    if (temp === '') {
        alert('검색어를 입력하세요.')
        $("#keyword").focus();
        return false
    } else {
        keywordUrl = 'https://www.wconcept.co.kr/Search?kwd=' + temp + '&sort=1'
        url = 'https://www.wconcept.co.kr'
        $.ajax({
            type: "POST",
            url: "/search",
            data: {
                'keywordUrl': keywordUrl,
                'url': url
            },
            success: function(response) { // 성공하면
                if (response['result'] == 'success') {
                    for (let i = 0; i < response['data'].length; i++) {
                        const prdList = response['data'][i];
                        make_card(prdList)
                    }
                }
            }
        })
    }
}


function musinsaSearch(temp) {
    if (temp === '') {
        alert('검색어를 입력하세요.')
        $("#keyword").focus();
        return false
    } else {
        url = 'https://search.musinsa.com/search/wusinsa/?q=' + temp
        $.ajax({
            type: "POST",
            url: "/musinsaSearch",
            data: {
                'url': url
            },
            success: function(response) { // 성공하면
                if (response['result'] == 'success') {
                    for (let i = 0; i < response['data'].length; i++) {
                        const prdList = response['data'][i];
                        make_card(prdList)
                    }
                }
            }
        })
    }
}

function make_card(prdList) {
    let temp_html = `<div class="card" style="width: 14rem;">
            <a href="${prdList.imgUrl}">
                <img src="${prdList.imgUrl}" class="card-img-top" alt="...">
            </a>
            <div class="card-body">
                <div class="card-title">
                    <h5>${prdList.brdName}</h5>
                    <p style="font-weight:300;">${prdList.prdName}</p>
                </div>
                <p class="card-text"> ${prdList.prdPrice} 원</p>
                <a href="${prdList.prdUrl}" class="btn btn-primary" role="button" target="_blank">구매하기</a> 
                <a href="#" class="btn btn-default" role="button" onclick="prd_like('${prdList.siteName}','${prdList.prdUrl}')">찜하기</a>
            </div>
        </div>`;

    const site_name = prdList.siteName

    if (site_name === "wconcept") {
        $('#wconcept-wrap').append(temp_html);
    } else if (site_name === "musinsa") {
        $('#musinsa-wrap').append(temp_html);
    }
}