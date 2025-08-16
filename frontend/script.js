const postsContainer = document.getElementById('postsContainer');
const apiResponseDiv = document.getElementById('apiResponse');

// Navbar links
const showLoginBtn = document.getElementById('showLoginModal');
const showRegisterBtn = document.getElementById('showRegisterModal');
const logoutBtn = document.getElementById('logoutBtn');
const createPostLink = document.getElementById('createPostLink');

// Modal Elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeBtns = document.querySelectorAll('.close-btn');

// Links inside modals
const showLoginFromRegister = document.getElementById('showLoginFromRegister');
const showRegisterFromLogin = document.getElementById('showRegisterFromLogin');

// Toast message element
const toastMessage = document.getElementById('toastMessage');

// Function to display toast messages
const showToast = (message) => {
    if (!toastMessage) {
        console.error('Toast element not found!');
        return;
    }
    toastMessage.textContent = message;
    toastMessage.className = 'show';
    setTimeout(() => {
        toastMessage.className = toastMessage.className.replace('show', '');
    }, 3000); // Hide after 3 seconds
};

// Function to update UI based on login status
const updateUI = () => {
    const token = localStorage.getItem('token');
    const loginPrompt = document.getElementById('loginPrompt');
    const usernameDisplay = document.getElementById('usernameDisplay'); // नया element

    if (token) {
        // Token को decode करके username प्राप्त करें
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decodedToken = JSON.parse(window.atob(base64));
            
            // यहाँ बदलाव किया गया है: 'username' को 'name' से बदला गया है
            const username = decodedToken.user.name; 
            
            usernameDisplay.textContent = `Hello, ${username}`;
            usernameDisplay.style.display = 'inline';

        } catch (error) {
            console.error('Invalid token:', error);
            localStorage.removeItem('token');
            updateUI();
            return;
        }

        showLoginBtn.style.display = 'none';
        showRegisterBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        createPostLink.style.display = 'block';
        if (loginPrompt) {
            loginPrompt.style.display = 'none';
        }
    } else {
        showLoginBtn.style.display = 'block';
        showRegisterBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        createPostLink.style.display = 'none';
        usernameDisplay.style.display = 'none';
        if (loginPrompt) {
            loginPrompt.style.display = 'block';
        }
    }
    fetchAndDisplayPosts();
};

// --- Post Deletion Handler ---
const deletePost = async (event) => {
    const postId = event.target.dataset.id;
    const token = localStorage.getItem('token');
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });

        const data = await response.json();
        if (response.ok) {
            showToast('Post deleted successfully!');
            fetchAndDisplayPosts();
        } else {
            showToast(`Error: ${data.msg || 'Could not delete post'}`);
        }
    } catch (error) {
        showToast(`Error: Could not connect to the backend.`);
    }
};

// --- Post Editing Handler ---
const editPost = async (event) => {
    const postId = event.target.dataset.id;
    const postElement = document.getElementById(`post-text-${postId}`);
    const currentText = postElement.textContent;
    const newText = prompt('Edit your post:', currentText);

    if (newText === null || newText === currentText || newText.trim() === '') {
        return;
    }

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ text: newText })
        });

        const data = await response.json();
        if (response.ok) {
            showToast('Post updated successfully!');
            fetchAndDisplayPosts();
        } else {
            showToast(`Error: ${data.msg || 'Could not update post'}`);
        }
    } catch (error) {
        showToast(`Error: Could not connect to the backend.`);
    }
};

// --- Toggle Like ---
const toggleLike = async (event) => {
    const likeBtn = event.target.closest('.like-btn');
    if (!likeBtn) return;

    const postId = likeBtn.dataset.id;
    const token = localStorage.getItem('token');

    let response;
    let action;
    const hasLiked = likeBtn.querySelector('i').classList.contains('fas');

    if (hasLiked) {
        action = 'unlike';
        response = await fetch(`http://localhost:5000/api/posts/unlike/${postId}`, {
            method: 'PUT',
            headers: { 'x-auth-token': token }
        });
    } else {
        action = 'like';
        response = await fetch(`http://localhost:5000/api/posts/like/${postId}`, {
            method: 'PUT',
            headers: { 'x-auth-token': token }
        });
    }

    if (response.ok) {
        showToast(`Post ${action}d!`);
        fetchAndDisplayPosts();
    } else {
        const errorData = await response.json();
        showToast(`Error: ${errorData.msg || 'Could not perform action.'}`);
    }
};

// --- Add Comment Handler ---
const addComment = async (event) => {
    event.preventDefault();
    const postId = event.target.dataset.id;
    const text = event.target.querySelector('input').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:5000/api/posts/comment/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({ text })
        });

        if (response.ok) {
            event.target.querySelector('input').value = '';
            showToast('Comment added!');
            fetchAndDisplayPosts();
        } else {
            showToast('Could not add comment.');
        }
    } catch (error) {
        showToast('Error adding comment.');
    }
};

// --- Toggle Comments ---
const toggleComments = async (event) => {
    const postId = event.target.closest('.post-actions').querySelector('.comment-btn').dataset.id;
    const commentsContainer = document.getElementById(`comments-container-${postId}`);
    const token = localStorage.getItem('token');

    if (commentsContainer.style.display === 'block') {
        commentsContainer.style.display = 'none';
        return;
    }

    commentsContainer.style.display = 'block';
    commentsContainer.innerHTML = '<p>Loading comments...</p>';

    try {
        const response = await fetch(`http://localhost:5000/api/posts`, {
            method: 'GET',
            headers: { 'x-auth-token': token }
        });
        const posts = await response.json();
        const post = posts.find(p => p._id === postId);

        if (post && post.comments.length > 0) {
            commentsContainer.innerHTML = '';
            post.comments.forEach(comment => {
                commentsContainer.innerHTML += `
                    <div class="comment">
                        <strong>${comment.name}</strong>: ${comment.text}
                    </div>
                `;
            });
        } else {
            commentsContainer.innerHTML = '<p>No comments yet.</p>';
        }

        commentsContainer.innerHTML += `
            <form class="comment-form" data-id="${postId}">
                <input type="text" placeholder="Add a comment..." required />
                <button type="submit">Submit</button>
            </form>
        `;

        // Attach event listener to the new comment form
        document.querySelector(`.comment-form[data-id="${postId}"]`).addEventListener('submit', addComment);

    } catch (error) {
        commentsContainer.innerHTML = '<p>Could not load comments.</p>';
    }
};

// Function to fetch and display posts automatically
const fetchAndDisplayPosts = async () => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:5000/api/posts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        });

        const data = await response.json();

        if (response.ok) {
            postsContainer.innerHTML = '';

            if (data.length > 0) {
                let currentUserId = null;
                if (token) {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const decodedToken = JSON.parse(window.atob(base64));
                    currentUserId = decodedToken.user.id;
                }

                data.forEach(post => {
                    const hasLiked = post.likes.some(like => like.user === currentUserId);
                    const heartIconClass = hasLiked ? 'fas' : 'far';

                    const postDiv = document.createElement('div');
                    postDiv.className = 'post';

                    let imageHTML = '';
                    if (post.image) {
                        imageHTML = `<img src="http://localhost:5000${post.image}" alt="Post Image">`;
                    }

                    const likeCount = post.likes.length;
                    const commentCount = post.comments.length;

                    postDiv.innerHTML = `
                        <h3>${post.name}</h3>
                        <p id="post-text-${post._id}">${post.text}</p>
                        ${imageHTML}
                        <div class="post-actions">
                            <button class="like-btn" data-id="${post._id}"><i class="${heartIconClass} fa-heart"></i> <span>${likeCount}</span></button>
                            <button class="comment-btn" data-id="${post._id}"><i class="fas fa-comment-dots"></i> <span>${commentCount}</span></button>
                            <button class="edit-btn" data-id="${post._id}" style="display:none;"><i class="fas fa-pen-to-square"></i></button>
                            <button class="delete-btn" data-id="${post._id}" style="display:none;"><i class="fas fa-trash-can"></i></button>
                        </div>
                        <div id="comments-container-${post._id}" class="comments-container" style="display:none;"></div>
                    `;
                    postsContainer.appendChild(postDiv);

                    if (currentUserId && post.user === currentUserId) {
                        const editBtn = postDiv.querySelector('.edit-btn');
                        const deleteBtn = postDiv.querySelector('.delete-btn');
                        if(editBtn) editBtn.style.display = 'inline-block';
                        if(deleteBtn) deleteBtn.style.display = 'inline-block';
                    }
                });

                // Attach event listeners after buttons are created
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', deletePost);
                });
                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', editPost);
                });
                document.querySelectorAll('.like-btn').forEach(button => {
                    button.addEventListener('click', toggleLike);
                });
                document.querySelectorAll('.comment-btn').forEach(button => {
                    button.addEventListener('click', toggleComments);
                });

            } else {
                postsContainer.textContent = 'No posts found.';
            }

        } else {
            showToast(`Error: ${data.msg || 'Could not get posts'}`);
        }
    } catch (error) {
        showToast(`Error: Could not connect to the backend.`);
        console.error('Fetch error:', error);
    }
};

// --- User Registration Form Handler ---
document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!username || !email || !password) {
        showToast('Error: All fields are required.');
        return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        showToast('Error: Please enter a valid email address.');
        return;
    }
    if (password.length < 6) {
        showToast('Error: Password must be at least 6 characters.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Registration successful! Please log in.');
            setTimeout(() => {
                registerModal.style.display = 'none';
                loginModal.style.display = 'block';
                document.getElementById('registerForm').reset();
            }, 500);
        } else {
            let errorMessage = '';
            if (data.errors) {
                errorMessage = data.errors.map(err => err.msg).join('\n');
            } else {
                errorMessage = data.msg || 'Registration failed';
            }
            showToast(`Error: ${errorMessage}`);
        }
    } catch (error) {
        showToast(`Error: Could not connect to the backend.`);
        console.error('Fetch error:', error);
    }
});

// --- User Login Form Handler ---
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('log-email').value;
    const password = document.getElementById('log-password').value;

    if (!email || !password) {
        showToast('Error: Email and password are required.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            showToast('Login successful!');
            setTimeout(() => {
                loginModal.style.display = 'none';
                document.getElementById('loginForm').reset();
                window.location.href = 'index.html';
            }, 500);
        } else {
            let errorMessage = '';
            if (data.errors) {
                errorMessage = data.errors.map(err => err.msg).join('\n');
            } else {
                errorMessage = data.msg || 'Login failed';
            }
            showToast(`Error: ${errorMessage}`);
        }
    } catch (error) {
        showToast(`Error: Could not connect to the backend.`);
    }
});

// Show/Hide Modals
showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'block';
});

showRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'block';
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    });
});

window.onclick = function(event) {
    if (event.target == loginModal || event.target == registerModal) {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    }
};

// Modal Links logic
showLoginFromRegister.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'block';
});

showRegisterFromLogin.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    showToast('Logged out successfully!');
    updateUI();
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
});

// Initial load
window.addEventListener('load', updateUI);