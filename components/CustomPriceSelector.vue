<template>
  <div>
    <h2>Price Selector</h2>
    From: <input type="number" v-model="from"><br>
    To: <input type="number" v-model="to">
  </div>
</template>

<script>
    import buildFilterPriceVariant from '../helpers/buildFilterPriceVariant';

    export default {
        name: 'CustomPriceSelector',
        data () {
            return {
                from: 0,
                to: 50
            }
        },
        watch: {
            to () {
                this.applyFilter();
            },
            from () {
                this.applyFilter();
            }
        },
        methods: {
            applyFilter() {
                const filterVariant = buildFilterPriceVariant(this.from, this.to);
                this.$store.dispatch('category-next/switchSearchFilters', [ filterVariant ]);
            }
        }
    }
</script>

<style scoped>

</style>
