let pageName = document.getElementById("pageName");
let root = document.getElementById("root");
let menu = document.getElementById("menu");
let cart = document.getElementById("cart");
let header = document.getElementById("header");

// KOLLA OM DET FINNS EN KUNDVAGN
if (localStorage.getItem("cart")) {
  console.log("Finns en kundvagn");
  printCart();
} else {
  console.log("Skapar tom kundvagn");
  let cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  printCart();
}

//HÄMTA SIDANS TITEL OCH BESKRIVNING
fetch("http://164.90.234.180/wp-json")
  .then((res) => res.json())
  .then((data) => {
    console.log("data", data);
    pageName.innerText = data.name + " - " + data.description;
  })
  .catch((err) => console.log("err", err));
fetch("http://164.90.234.180/wp-json/wp/v2/media")
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    for (let index = 0; index < data.length; index++) {
      if (data[index].title.rendered == "moomin-bg") {
        header.style.backgroundImage =
          'url("' + data[index].guid.rendered + '")';
        console.log(data[index].link);
      }
    }
  });
//HÄMTAR MENY
fetch("http://164.90.234.180/wp-json/menus/v1/menus/headermeny")
  .then((res) => res.json())
  .then((data) => {
    console.log("posts", data);
    printPages(data);
  });

//HÄMTA PAGE CONTENT

function printContent(slug) {
  console.log(slug);
  fetch("http://164.90.234.180/wp-json/wp/v2/pages")
    .then((res) => res.json())
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].slug == slug) {
          console.log("GOT CONTENT!!: ", data[i].content.rendered);
          let content = data[i].content.rendered;
          return content;
        } else {
          console.log("404! Oj inget innehåll fanns här.");
        }
      }
    });
}
//LISTAR MENY
function printPages(pages) {
  let ul = document.createElement("ul");
  ul.id = "menu-list";
  pages.items.map((page) => {
    console.log("page", page.title);
    console.log("content:", page.content);
    let li = document.createElement("li");
    li.innerText = page.title;
    li.addEventListener("click", () => {
      wrapper.replaceChildren();
      if (page.slug == "shop") {
        getProducts();
      }
      if (page.slug == "nyheter") {
      }
      if (page.slug == "varukorg") {
        fetch("http://164.90.234.180/wp-json/wc/v3/products")
          .then((res) => res.json())
          .then((data) => {
            let arr = JSON.parse(localStorage.getItem("cart"));
            //För reduce: Ta antalet och nyckelvärdet som parametrar
            const map = arr.reduce(
              (acc, e) => acc.set(e, (acc.get(e) || 0) + 1),
              new Map()
            );
            let cartArr = [...map.entries()];
            let cartList = document.createElement("ul");
            console.info([...map.entries()]);
            console.log("mappa detta: " + [...map.entries()]);
            for (let i = 0; i < cartArr.length; i++) {
              let shopitem = document.createElement("li");
              shopitem.innerText = cartArr[0][0];
              cartList.appendChild(shopitem);
            }
            wrapper.appendChild(cartList);
          });
      }
      if (page.slug == "om-oss") {
        fetch("http://164.90.234.180/wp-json/wp/v2/pages")
          .then((res) => res.json())
          .then((data) => {
            for (let i = 0; i < data.length; i++) {
              if (data[i].slug == page.slug) {
                console.log("GOT CONTENT!!: ", data[i].content.rendered);
                let content = data[i].content.rendered;
                wrapper.innerHTML = content;
              } else {
                console.log("404! Oj inget innehåll fanns här.");
              }
            }
          });
      }
    });
    ul.appendChild(li);
  });
  menu.appendChild(ul);
}
//HÄMTAR PRODUKTER
getProducts();

function getProducts() {
  fetch("http://164.90.234.180/wp-json/wc/store/products")
    .then((res) => res.json())
    .then((data) => {
      console.log("produkter", data);
      printProductList(data);
    });
}
//LISTAR PRODUKTER
function printProductList(products) {
  let ul = document.createElement("ul");
  ul.id = "productlist";

  products.map((product) => {
    let li = document.createElement("li");
    let productImg = document.createElement("img");
    let pCard = document.createElement("div");
    let addBtn = document.createElement("button");
    let pName = document.createElement("h3");
    let price = document.createElement("p");
    pCard.className = "card";
    pName.className = "productName";
    productImg.src = product.images[0].src;
    productImg.className = "productImg";
    pName.innerHTML = product.name;
    price.innerText = product.prices.price + product.prices.currency_suffix;
    addBtn.innerText = "Lägg i kundvagn";
    li.appendChild(pName);
    li.appendChild(pCard);
    pCard.appendChild(productImg);
    pCard.appendChild(price);
    pCard.appendChild(addBtn);

    addBtn.addEventListener("click", () => {
      console.log("Click på produkt", product.id);

      // HÄMTA
      let cart = JSON.parse(localStorage.getItem("cart"));
      console.log("cart från LS", cart);

      // ÄNDRA
      cart.push(product.id);

      // SPARA
      localStorage.setItem("cart", JSON.stringify(cart));
      printCart();
    });

    ul.appendChild(li);
  });
  wrapper.appendChild(ul);
}
//HANTERA KUNDVAGN
function printCart() {
  if (JSON.parse(localStorage.getItem("cart")).length > 0) {
    console.log("Finns produkter");
    cart.innerText =
      JSON.parse(localStorage.getItem("cart")).length + " st produkter";

    let emptyCartBtn = document.createElement("button");
    emptyCartBtn.innerText = "Töm kundvagnen";

    emptyCartBtn.addEventListener("click", () => {
      localStorage.setItem("cart", JSON.stringify([]));
      printCart();
    });

    let sendOrderBtn = document.createElement("button");
    sendOrderBtn.innerText = "Skicka order";

    sendOrderBtn.addEventListener("click", postOrder);

    cart.append(emptyCartBtn, sendOrderBtn);
  } else {
    console.log("Tom kundvagn");
    cart.innerText = "Inga produkter";
  }
}

function postOrder() {
  console.log("Skicka order");

  // SKAPA BODY
  let order = {
    payment_method: "bacs",
    payment_method_title: "Direct Bank Transfer",
    set_paid: true,
    customer_id: 1,
    billing: {
      first_name: "Janne",
      last_name: "Kemi",
      adress_1: "Gatan 10",
      city: "Uddebo",
      postcode: "514 92",
      country: "SE",
      email: "janne@hiveandfive.se",
      phone: "070123456",
    },
    shipping: {
      first_name: "Janne",
      last_name: "Kemi",
      adress_1: "Gatan 10",
      city: "Uddebo",
      postcode: "514 92",
      country: "SE",
      email: "janne@hiveandfive.se",
      phone: "070123456",
    },
    line_items: [
      // LOOPA IGENOM KUNDVAGN
    ],
    shipping_lines: [
      {
        method_id: "flat_rate",
        method_title: "Flat rate",
        total: "100",
      },
    ],
  };

  fetch("http://164.90.234.180/wp-json/wc/v3/orders", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(order),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Order skickad", data);
      localStorage.setItem("cart", JSON.stringify([]));
      printCart();
    })
    .catch((err) => console.log("err", err));
}
