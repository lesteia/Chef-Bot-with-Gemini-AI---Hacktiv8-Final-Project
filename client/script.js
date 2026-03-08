const userInput = document.getElementById('userInput');
const imageInput = document.getElementById('imageInput');
const imageButton = document.getElementById('imageButton');
const sendButton = document.getElementById('sendButton');
const messagesContainer = document.getElementById('messagesContainer');
const loadingSpinner = document.getElementById('loadingSpinner');

// Trigger input file saat tombol "Upload Image" diklik
imageButton.addEventListener('click', () => imageInput.click());

// Fungsi untuk menambah gelembung chat ke UI
const appendMessage = (role, text) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

const sendMessage = async () => {
    const message = userInput.value.trim();
    const file = imageInput.files[0];

    // Validasi: Jangan kirim jika tidak ada teks dan tidak ada gambar
    if (!message && !file) return;

    // Tampilkan pesan user di UI
    appendMessage('user', message || (file ? "Sent an image" : ""));
    
    // Reset input dan tampilkan loading
    userInput.value = '';
    imageInput.value = '';
    loadingSpinner.style.display = 'block';

    // Bungkus data ke FormData
    const formData = new FormData();
    formData.append('message', message);
    if (file) {
        formData.append('image', file);
    }

    try {
        const response = await fetch('http://localhost:3000/chat-bot', {
            method: 'POST',
            body: formData // Fetch akan otomatis mengatur Content-Type menjadi multipart/form-data
        });

        const data = await response.json();

        if (response.ok) {
            appendMessage('ai', data.result);
        } else {
            appendMessage('ai', `Error: ${data.error}`);
        }
    } catch (error) {
        appendMessage('ai', "Maaf, terjadi gangguan koneksi ke server.");
        console.error(error);
    } finally {
        loadingSpinner.style.display = 'none';
    }
};

// Event listener tombol send dan tombol Enter
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});