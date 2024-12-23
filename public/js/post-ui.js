// Like post button logic
$(document).on('click', '.post-like, .comment-like', function () {
    const icon = $(this).find('i');

    if (icon.hasClass('fa-regular')) {
        // đang là unlike -> chuyển sang like
        icon.removeClass('fa-regular').addClass('text-blue-600 fa-solid');
    } else {
        // đang là like -> chuyển sang unlike
        icon.removeClass('text-blue-600 fa-solid').addClass('fa-regular');
    }
});


$(document).on('click', '.post-comment', function () {
    console.log('click');

    // Lấy postId từ thuộc tính data-post-id
    const postId = $(this).closest('[data-post-id]').data('post-id');

    // fetch data từ postid
    const comments = [
        {
            author: 'nva',
            avatar: '/images/avatar1.png',
            content: 'good',
        },
        {
            author: 'nvb',
            avatar: '/images/avatar2.png',
            content: 'bad',
        },
    ];

    // Tạo modal chứa danh sách comment
    const post_details = $(`
        <div class="w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50">
            <div id="container" class="w-1/2 h-2/3 bg-white rounded overflow-y-auto">
                <div class="flex justify-end p-2 pr-4">
                    <button id="close-modal" class="text-gray-500 hover:text-black text-xl">&times;</button>
                </div>
            </div>
        </div>
    `);

    // Thêm từng comment vào container
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        $(post_details).find('#container').append(
            `
            <div class="flex p-4 border-b">
                <img class="rounded-full w-12 h-12 mr-4" src="${comment.avatar}" alt="user-avatar">
                <div class="rounded-xl flex-grow flex bg-gray-200 justify-between items-center">
                    <div class="rounded-xl p-2 pl-4 pr-4">
                        <div class="font-bold">${comment.author}</div>
                        <div>${comment.content}</div>
                    </div>
                    <div class="comment-like flex text-xl mr-2">
                        <i class="fa-regular fa-thumbs-up mr-2 cursor-pointer"></i>
                    </div>
                </div>
            </div>
            `
        );
    }

    // Thêm modal vào body
    $('body').append(post_details);

    $('body').addClass('no-scroll');

    // Đóng modal khi nhấn nút close
    $(document).on('click', '#close-modal', function () {
        post_details.remove();
        $('body').removeClass('no-scroll');
    });
});
