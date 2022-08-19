<template>
  <qrcode-vue  :value="'https://hxx.huifintech.com/chat_user/chatroom?id='+store.state.roomId" :size="size" level="H" />
</template>
<script>
import QrcodeVue from 'qrcode.vue'
import {reactive, toRefs,defineComponent} from "vue";
import {useStore} from "vuex";
export default defineComponent({
  components: {
    QrcodeVue,
  },
  setup(props,context) {
    const store = useStore()

    const data = reactive({
      size: props.screenWidth>786?300:200,
      value: props.value,
    });

    return {
      ...toRefs(data),store
    }
  }
})
</script>
