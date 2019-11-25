<template>
  
</template>

<script>
export default {
    methods: {
        checkCookieStatus: function(){
            const cookieStatus = this.$store.state.cookie_consent.cookieStatus
            if(cookieStatus==="deny"){
                this.$ga.disable()
            }
            else if(cookieStatus==="allow"){
                this.$ga.enable()
            }
        }
    },
    created: function () {
        this.checkCookieStatus()
        this.$store.subscribe((mutation,state)=>{
            if(mutation.type==="SET_COOKIE_STATUS"){
                this.checkCookieStatus()
            }
        })
    }
}
</script>

<style>

</style>