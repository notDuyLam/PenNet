$(document).ready(() => {
    $(document).on('click', '.delete-post-btn', async function() {
      const postId = $(this).data('id');
      console.log('Deleting post ID:', postId);
      if (confirm('Are you sure you want to delete this post?')) {
        try {
          const response = await fetch(`/posts/admin/${postId}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            alert('Post deleted successfully');
            location.reload();
          } else {
            alert('Error deleting post');
          }
        } catch (error) {
          console.error('Error deleting post:', error);
          alert('Error deleting post');
        }
      }
    });
  });