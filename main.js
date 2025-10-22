// =============================
// 🟢 HIỂN THỊ USER (HEADER)
// =============================
const user = JSON.parse(localStorage.getItem('currentUser'));
const userInfoDiv = document.getElementById('userInfo');
if (userInfoDiv) {
  if (user) {
    userInfoDiv.innerHTML = `
      <span class="me-2">${user.name} (${user.email})</span>
      <button class="btn btn-sm btn-light" id="logoutBtn">Đăng xuất</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      window.location.href = "login.html";
    });
  } else {
    userInfoDiv.innerHTML = `
      <a href="login.html" class="btn btn-sm btn-light me-2">Đăng nhập</a>
      <a href="register.html" class="btn btn-sm btn-outline-light">Đăng ký</a>
    `;
  }
}

// =============================
// 🟢 HIỂN THỊ DANH SÁCH SẢN PHẨM
// =============================
const productList = document.getElementById("productList");
if (productList) {
  fetch("http://localhost:3000/products/")
    .then(res => res.json())
    .then(data => {
      productList.innerHTML = data.map(p => `
        <div class="col-md-3">
          <div class="card h-100 shadow-sm">
            <img src="${p.image}" class="card-img-top" alt="${p.name}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title text-primary">${p.name}</h5>
              <p class="text-danger fw-bold">${p.price.toLocaleString()}₫</p>
              <a href="detail.html?id=${p.id}" class="btn btn-outline-primary mt-auto">Xem chi tiết</a>
            </div>
          </div>
        </div>
      `).join('');
    })
    .catch(err => productList.innerHTML = `<p class="text-center text-danger">Lỗi: ${err.message}</p>`);
}

// =============================
// 🟢 TRANG CHI TIẾT SẢN PHẨM
// =============================
const detailContainer = document.getElementById('product-detail');
if (detailContainer) {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    detailContainer.innerHTML = `<p class="text-danger">Không tìm thấy ID sản phẩm.</p>`;
  } else {
    fetch(`http://localhost:3000/products/${id}`)
      .then(res => res.json())
      .then(p => {
        detailContainer.innerHTML = `
          <div class="col-md-8">
            <div class="card p-4">
              <div class="row g-4">
                <div class="col-md-5">
                  <img src="${p.image}" class="img-fluid rounded">
                </div>
                <div class="col-md-7">
                  <h3>${p.name}</h3>
                  <p><b>Giá:</b> <span class="text-danger">${p.price.toLocaleString()}₫</span></p>
                  <p><b>Danh mục:</b> ${p.category}</p>
                  <p>${p.description}</p>
                  <button class="btn btn-primary mt-3" id="addCartBtn">🛒 Thêm vào giỏ hàng</button>
                </div>
              </div>
            </div>
          </div>
        `;
        document.getElementById('addCartBtn').addEventListener('click', () => addToCart(p));
      });
  }
}

// =============================
// 🟢 GIỎ HÀNG
// =============================
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(p) {
  const cart = getCart();
  const existing = cart.find(item => item.id === p.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...p, quantity: 1 });
  }
  saveCart(cart);
  alert(`✅ Đã thêm "${p.name}" vào giỏ hàng`);
}

// =============================
// 🟢 HIỂN THỊ GIỎ HÀNG
// =============================
const cartBody = document.getElementById("cart-body");
if (cartBody) {
  renderCart();
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    alert("Cảm ơn bạn đã mua hàng!");
    localStorage.removeItem("cart");
    renderCart();
  });
}

function renderCart() {
  const cart = getCart();
  const totalEl = document.getElementById("cart-total");
  if (cart.length === 0) {
    cartBody.innerHTML = `<tr><td colspan="6">🛍️ Giỏ hàng trống</td></tr>`;
    totalEl.textContent = "Tổng cộng: 0₫";
    return;
  }

  let total = 0;
  cartBody.innerHTML = cart.map((item, i) => {
    const sub = item.price * item.quantity;
    total += sub;
    return `
      <tr>
        <td><img src="${item.image}" width="70" class="rounded"></td>
        <td>${item.name}</td>
        <td>${item.price.toLocaleString()}₫</td>
        <td>
          <input type="number" min="1" value="${item.quantity}" class="form-control form-control-sm w-50 mx-auto"
            onchange="updateQuantity(${i}, this.value)">
        </td>
        <td>${sub.toLocaleString()}₫</td>
        <td><button class="btn btn-sm btn-danger" onclick="removeItem(${i})">Xóa</button></td>
      </tr>
    `;
  }).join('');
  totalEl.textContent = `Tổng cộng: ${total.toLocaleString()}₫`;
}

function updateQuantity(i, qty) {
  const cart = getCart();
  cart[i].quantity = Number(qty);
  saveCart(cart);
  renderCart();
}
function removeItem(i) {
  const cart = getCart();
  cart.splice(i, 1);
  saveCart(cart);
  renderCart();
}
// =============================
// 🟢 HIỂN THỊ DANH SÁCH TRONG ADMIN
// =============================
const adminTable = document.getElementById('adminTable');
const api = 'https://my-json-server.typicode.com/nguyentranleloi028/leloi/products';

function loadProducts() {
  fetch(api)
    .then(res => res.json())
    .then(data => {
      adminTable.innerHTML = data.map((p, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><img src="${p.image}" width="80" height="60" style="object-fit:cover" class="rounded"></td>
          <td>${p.name}</td>
          <td>${p.price.toLocaleString()} ₫</td>
          <td>${p.category}</td>
          <td>${p.description.slice(0, 60)}...</td>
          <td>
            <button class="btn btn-success btn-sm me-1" onclick="editProduct(${p.id})">Sửa</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Xóa</button>
          </td>
        </tr>
      `).join('');
    })
    .catch(err => console.error("Lỗi tải danh sách:", err));
}
loadProducts();

// =============================
// 🟢 XÓA SẢN PHẨM
// =============================
function deleteProduct(id) {
  if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
    fetch(`${api}/${id}`, { method: 'DELETE' })
      .then(() => loadProducts());
  }
}

// =============================
// 🟢 THÊM SẢN PHẨM
// =============================
document.getElementById('saveBtn').addEventListener('click', () => {
  const form = document.getElementById('addForm');
  const product = {
    name: form.name.value,
    price: +form.price.value,
    image: form.image.value,
    category: form.category.value,
    description: form.description.value,
    hot: form.hot.checked
  };

  fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  })
  .then(() => {
    loadProducts();
    form.reset();
    bootstrap.Modal.getInstance(document.getElementById('addModal')).hide();
  });
});

// =============================
// 🟢 SỬA SẢN PHẨM
// =============================
function editProduct(id) {
  alert("Phần sửa sẽ thêm sau — bạn có muốn mình bổ sung form chỉnh sửa trực tiếp không?");
}
const api1 = "https://my-json-server.typicode.com/nguyentranleloi028/leloi/products";

fetch(api1)
  .then(res => res.json())
  .then(data => {
    // Lọc sản phẩm nổi bật
    const hotProducts = data.filter(p => p.hot);
    document.getElementById("product-hot").innerHTML = renderProducts(hotProducts);

    // Lọc sản phẩm Laptop
    const laptopProducts = data.filter(p => p.category.toLowerCase() === "laptop");
    document.getElementById("product-laptop").innerHTML = renderProducts(laptopProducts);

    // Lọc sản phẩm Điện thoại
    const dienthoaiProducts = data.filter(p => p.category.toLowerCase() === "điện thoại");
    document.getElementById("product-dienthoai").innerHTML = renderProducts(dienthoaiProducts);
  })
  .catch(err => console.error("Lỗi tải sản phẩm:", err));

function renderProducts(list) {
  return list.map(p => `
    <div class="col-md-3">
      <div class="card h-100 shadow-sm">
        <img src="${p.image}" class="card-img-top" alt="${p.name}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-primary">${p.name}</h5>
          <p class="text-danger fw-bold">${p.price.toLocaleString()}₫</p>
          <a href="detail.html?id=${p.id}" class="btn btn-outline-primary mt-auto">Xem chi tiết</a>
        </div>
      </div>
    </div>
  `).join('');
}
