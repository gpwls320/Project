$(document).ready(function() {
    likeList();
});

function likeList() {
    $.ajax({
        type: "GET",
        url: "/likeList",
        data: {},
        success: function(response) { // 성공하면
            if (response['result'] == 'success') {
                for (let i = 0; i < response['data'].length; i++) {
                    const prdList = response['data'][i];
                    make_likeList(prdList)
                }

                $('#nav-wconcept-tab').append(" (" + response['count']['wconcept_count'] + ")");
                $('#nav-musinsa-tab').append(" (" + response['count']['musinsa_count'] + ")");
            }
        },
        beforeSend: function() {
            $("#wrap-loading").show();
        },
        complete: function() {
            $("#wrap-loading").hide();
        }
    });
}

function make_likeList(prdList) {
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
                <a href="#" class="btn btn-default" role="button" onclick="prd_unlike('${prdList.product_id}')">찜해제</a>
            </div>
        </div>`;

    const site_name = prdList.siteName
    const count = prdList.count

    if (site_name === "wconcept") {
        $('#wconcept-wrap').append(temp_html);
    } else if (site_name === "musinsa") {
        $('#musinsa-wrap').append(temp_html);
    }
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