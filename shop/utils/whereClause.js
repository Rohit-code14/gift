class whereClause{
    constructor(base,bigQ){
        this.base = base
        this.bigQ = bigQ
    }
    search(){
        const searchWord = this.bigQ.search ? {
            name:{
                $regex: this.bigQ.search,
                $options:'i'
            }
        } : {}
        this.base = this.base.find({...searchWord})
        return this
    }

    pager(resultPerPage){
        let currentPage = 1
        if (this.bigQ.page){
            currentPage = this.bigQ.page
        }
        this.base = this.base.limit(resultPerPage).skip((currentPage-1)*resultPerPage)
        return this
    }

    filter(){
        const copyQ = {...this.bigQ}
        delete copyQ["search"];
        delete copyQ["page"]
        delete copyQ["limit"]

        let stringOfCopyQ = JSON.stringify(copyQ)

        stringOfCopyQ = stringOfCopyQ.replace(/\b(gte|lte|gt|lt)\b/g,m => `$${m}`)
        let jsonOfCopyQ = JSON.parse(stringOfCopyQ)

        this.base.find(jsonOfCopyQ)
        return this
    }
}

module.exports = whereClause;
