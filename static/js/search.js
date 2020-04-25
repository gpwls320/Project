$(document).ready(function() {
    // $('#nav-tab a').click(function(e) {
    //     alert(e)
    //     e.preventDefault();
    // });

    $('#nav-wconcept-tab').click(function() {
        search()
    })

    $('#nav-musinsa-tab').click(function() {
        musinsaSearch()
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
            if (response['result'] == 'success') {
                // 2. '좋아요 완료!' 얼럿을 띄웁니다.
                alert('찜하기 완료!')
            }
        }
    });
}

function search() {
    keyword = $("#keyword").val();
    if (keyword === '') {
        alert('검색어를 입력하세요.')
        $("#keyword").focus();
        return false
    } else {
        keyword = $("#keyword").val();
        keywordUrl = 'https://www.wconcept.co.kr/Search?kwd=' + keyword + '&sort=1'
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

function musinsaSearch() {
    keyword = $("#keyword").val();
    if (keyword === '') {
        alert('검색어를 입력하세요.')
        $("#keyword").focus();
        return false
    } else {
        url = 'https://search.musinsa.com/search/wusinsa/?q=' + keyword
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
            <img src="${prdList.imgUrl}" class="card-img-top" alt="...">
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

function prd_unlike(prdUrl) {
    alert(prdUrl)
    $.ajax({
        type: "POST",
        url: '/unlike',
        data: {
            "prd_url": prdUrl
        },
        success: function(reponse) {
            if (response['result'] == 'success') {
                alert('찜 해제 완료!')
            }
        }
    })
}