$(function () {
    $('.delete_btn').on('click', function (e) {
        var articleId = $(this).data('id');

        $.ajax({
            type: 'DELETE',
            url: '/articles/delete/' + articleId,
            success: function (response) {
                alert(response.message);
                window.location.href = '/articles';
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
});