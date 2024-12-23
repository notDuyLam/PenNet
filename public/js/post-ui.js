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
    // lấy user
    const user = {name: "name"};

    // Lấy postId từ thuộc tính data-post-id
    const postId = $(this).closest('[data-post-id]').data('post-id') || '111';

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
        {
            author: 'nva',
            avatar: '/images/avatar1.png',
            content: 'good',
        },
        {
            author: 'nva',
            avatar: '/images/avatar1.png',
            content: 'good',
        },
    ];

    // Tạo modal chứa danh sách comment
    const post_details = $(`
        <div class="w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50">
            <div class="flex flex-col w-1/2 h-2/3 bg-white rounded">
                <div class="flex justify-end p-2 pr-4">
                    <button id="close-modal" class="text-gray-500 hover:text-black text-xl">&times;</button>
                </div>
                <div id="container" class="flex-grow overflow-y-auto">
                    
                </div>
                <div class="flex p-4 border-b">
                    <img class="rounded-full w-12 h-12 mr-4" src="${user.avatar}" alt="user-avatar">
                    <div class="rounded-xl flex-grow flex bg-gray-200 items-center w-full">
                        <div class="rounded-xl p-2 pl-4 pr-4 flex-grow">
                            <div class="font-bold">${user.name}</div>
                            <form id="comment-form">
                                <input 
                                    name="content" id="content" type="text" 
                                    class="w-full p-4 border border-[#ECF0F5] 
                                    rounded-md text-sm text-[#707988]" placeholder="Comment here"
                                />
                            </form>
                            
                        </div>
                    </div>
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

    $(post_details).find('#comment-form').on('submit', function (e) {
        e.preventDefault();

        const form = $(this);
        const content = form.find('#content').val(); // Lấy nội dung comment

        if (!content.trim()) {
            alert('Comment cannot be empty!');
            return;
        }
        console.log({ postId, content });
        // Gửi dữ liệu comment về server qua AJAX
        $.ajax({
            url: '/add-comment',
            method: 'POST',
            data: { postId, content },
            success: function (response) {
                // Thêm comment mới vào danh sách mà không cần reload
                $(post_details).find('#container').append(
                    `
                    <div class="flex p-4 border-b">
                        <img class="rounded-full w-12 h-12 mr-4" src="${user.avatar}" alt="user-avatar">
                        <div class="rounded-xl flex-grow flex bg-gray-200 justify-between items-center">
                            <div class="rounded-xl p-2 pl-4 pr-4">
                                <div class="font-bold">${user.name}</div>
                                <div>${content}</div>
                            </div>
                            <div class="comment-like flex text-xl mr-2">
                                <i class="fa-regular fa-thumbs-up mr-2 cursor-pointer"></i>
                            </div>
                        </div>
                    </div>
                    `
                );
                form[0].reset(); // Reset form sau khi gửi thành công
            },
            error: function (err) {
                console.error(err);
                alert('Failed to add comment.');
            },
        });
    });

    // Thêm modal vào body
    $('body').append(post_details);

    $('body').addClass('no-scroll');

    // Đóng modal khi nhấn nút close
    $(document).on('click', '#close-modal', function () {
        post_details.remove();
        $('body').removeClass('no-scroll');
    });
});
