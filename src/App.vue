<template>
  <router-view />
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import accountStatusService from '@/services/AccountStatusService';

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    accountStatusService.onLocked((data) => {
      console.log('🔒 Account locked:', data);
    });
    accountStatusService.startChecking(8000);
    console.log('✅ Account status checking started');
  }
});

onBeforeUnmount(() => {
  accountStatusService.stopChecking();
  console.log('✅ Account status checking stopped');
});
</script>