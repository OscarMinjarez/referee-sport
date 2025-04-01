<template>
  <Navbar />
  <main class="w-100">
    <div class="container-fluid d-flex flex-wrap gap-3 justify-content-center my-4">
      <div v-for="product in products">
        <ProductCard
          :productName="product.name"
          :productPrice="product.price"
          :productStock="product.stock"/>
      </div>
    </div>
  </main>
</template>

<script setup>
import Navbar from '../../components/Navbar.vue';
import ProductCard from "../../components/ProductCard.vue";

const products = [
  {
    uuid: 1,
    name: "Juventus",
    price: 280,
    stock: 12
  },
  {
    uuid: 2,
    name: "Barcelona FC",
    price: 280,
    stock: 10
  },
  {
    uuid: 3,
    name: "Real Madrid",
    price: 320,
    stock: 4
  },
  {
    uuid: 4,
    name: "AC Milan",
    price: 300,
    stock: 122
  },
  {
    uuid: 5,
    name: "Inter Miami",
    price: 450,
    stock: 30
  },
  {
    uuid: 6,
    name: "Portugal FC",
    price: 380,
    stock: 30
  }
];
</script>