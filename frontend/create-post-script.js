// Post Creation Form
const createPostForm = document.getElementById('createPostForm');
const postTextarea = document.getElementById('postText');
const postImageInput = document.getElementById('postImage');

// --- Post Creation Form Handler ---
createPostForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const postText = postTextarea.value;
    const postImage = postImageInput.files[0];
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Error: Please log in to create a post.');
        return;
    }

    if (!postText && !postImage) {
        alert('Error: Post text or an image is required.');
        return;
    }

    const formData = new FormData();
    formData.append('text', postText);
    if (postImage) {
        formData.append('image', postImage);
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: {
                'x-auth-token': token
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert('Post created successfully!');
            postTextarea.value = '';
            postImageInput.value = '';
            window.location.href = 'index.html'; // Redirect to home page
        } else {
            alert(`Error: ${data.msg || 'Could not create post'}`);
        }
    } catch (error) {
        alert(`Error: Could not connect to the backend. \n\n ${error}`);
    }
});

// --- Logout functionality ---
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    alert('Logged out successfully!');
    window.location.href = 'index.html'; // Redirect to home page
});

// Check if user is logged in
window.addEventListener('load', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to create a post.');
        window.location.href = 'index.html'; // Redirect if not logged in
    } else {
        document.getElementById('logoutBtn').style.display = 'block';
    }
});