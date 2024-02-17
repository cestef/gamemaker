const defaultOptions = {
    checkInterval: 5000,
    queue: [],
    minMatchSize: 2,
    maxMatchSize: 5,
    matchPlayersFunction: (...players) => {
        return true
    },
    sortQueueFunction: (a, b) => {
        return a.addedAt - b.addedAt
    }
}
class MatchMaker {
    /**
     * 
     * @param {Function} resolver Fired when a game is launched
     * @param {Function} getKey Fired to get a player ID
     * @param {defaultOptions} options Matchmaker options
     */
    constructor(resolver, getKey, options) {
        /**
         * @param {Object[]} players Array of players that got matched together
         */
        this.resolver = resolver;
        /**
         * @returns {String} ID of the player
         */
        this.getKey = getKey;
        this.options = options;
        this.interval = null
        this.queue = options ? Array.isArray(options.queue) ? options.queue : defaultOptions.queue : defaultOptions.queue;
        this.checkInterval = options ? typeof options.checkInterval === "number" ? options.checkInterval : defaultOptions.checkInterval : defaultOptions.checkInterval;
        this.minMatchSize = options ? typeof options.minMatchSize === "number" ? options.minMatchSize : defaultOptions.minMatchSize : defaultOptions.minMatchSize;
        this.maxMatchSize = options ? typeof options.maxMatchSize === "number" ? options.maxMatchSize : defaultOptions.maxMatchSize : defaultOptions.maxMatchSize;
        this.matchPlayersFunction = options ? typeof options.matchPlayersFunction === "function" ? options.matchPlayersFunction : defaultOptions.matchPlayersFunction : defaultOptions.matchPlayersFunction;
        this.getQueue = options ? typeof options.getQueue === "function" ? options.getQueue : () => this.queue : () => this.queue;
        this.updateQueue = options ? typeof options.updateQueue === "function" ? options.updateQueue : (q) => this.queue = q : (q) => this.queue = q
        this.checkParams()
    }
    checkParams() {
        if (typeof this.resolver !== "function") throw new Error("[gamemaker] 'resolver' type has to be 'function'")
        if (typeof this.getKey !== "function") throw new Error("[gamemaker] 'getKey' type has to be 'function'")
        if (typeof this.options === "undefined") this.options = defaultOptions
    }
    /**
     * Get a player object by its ID
     * @param {String} id ID of the player to get
     */
    async getPlayerByID(id) {
        let index = (await this.getQueue()).findIndex(e => this.getKey(e.player) === id)
        if (index === -1) return null
        return this.getPlayerByIndex(index)
    }
    /**
     * Get a player object by its index in the queue
     * @param {Number} index Index of the player to get
     */
    async getPlayerByIndex(index) {
        return (await this.getQueue())[index]
    }
    /**
     * Start the matchmaker
     */
    init() {
        this.interval = setInterval(() => {
            this.fetchQueue()
        }, this.checkInterval)
    }
    /**
     * Fetch the queue and match players if possible
     */
    async fetchQueue() {
        this.queue = (await this.getQueue()).sort(this.sortQueueFunction)
        let groups = await this.chunkQueue(this.maxMatchSize)
        for (let i = groups.length - 1; i >= 0; i--) {
            let g = groups[i];
            if (g.length >= this.minMatchSize) {
                if (this.matchPlayersFunction(g)) {
                    groups.splice(i, 1);
                    this.resolver(g);
                }
            }
        }
        let tempQueue = []
        groups.forEach(e => e.forEach(a => tempQueue.push(a)))
        await this.updateQueue(tempQueue.sort(this.sortQueueFunction))
    }
    /**
     * Add a player to the queue
     * @param {Object} player Player to add to the matchmaking queue
     */
    async addPlayer(player) {
        await this.updateQueue(this.queue.concat({
            player: player,
            addedAt: Date.now()
        }))
    }
    /**
     * Remove a player from the queue by its ID
     * @param {String} id ID of the player to remove
     */
    async removePlayerByID(id) {
        let index = (await this.getQueue()).findIndex(e => this.getKey(e.player) === id)
        if (index === -1) return null
        return (await this.removePlayerByIndex(index))
    }
    /**
     * Remove a player from the queue by its index
     * @param {Number} index Index of the player to remove
     */
    async removePlayerByIndex(index) {
        let queue = await this.getQueue()
        if (!queue[index]) return null
        await this.updateQueue(queue.filter((e, i) => i!=index))
        return 
    }
    async chunkQueue(chunkSize) {
        var array = await this.getQueue();
        return [].concat.apply([],
            array.map(function (elem, i) {
                return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
            })
        );
    }
}
module.exports = MatchMaker
