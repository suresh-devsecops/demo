const cds = require('@sap/cds')

class CatalogService extends cds.ApplicationService {

  init() {

    const { Books } = cds.entities('sap.capire.bookshop')
    const { ListOfBooks } = this.entities

    this.before('*',async (req)=>{
      const authHeader = req._.req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
          const jwtToken = authHeader.split(' ')[1];
          console.log('Incoming JWT Token:', jwtToken);
      } else {
          console.log('No JWT token found in the Authorization header.');
      }
    });
    // Add some discount for overstocked books
    this.after('each', ListOfBooks, book => {
      if (book.stock > 111) book.title += ` -- 11% discount!`
    })

    this.on('printJwt', async (req) => {
      // Extract JWT from the Authorization header
      const authHeader = req.headers['authorization'];
      let jwt;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        jwt = authHeader.split(' ')[1]; // Get the token part
      } else {
        req.error(400, 'No JWT provided');
        return;
      }

      // Print the JWT (or return it as a response)
      console.log('Received JWT:', jwt);
      return { jwt }; // Return it in the response if needed
    });

    // Reduce stock of ordered books if available stock suffices
    this.on('submitOrder', async req => {
      let { book: id, quantity } = req.data
      let book = await SELECT.one.from(Books, id, b => b.stock)

      // Validate input data
      if (!book) return req.error(404, `Book #${id} doesn't exist`)
      if (quantity < 1) return req.error(400, `quantity has to be 1 or more`)
      if (!book.stock || quantity > book.stock) return req.error(409, `${quantity} exceeds stock for book #${id}`)

      // Reduce stock in database and return updated stock value
      await UPDATE(Books, id).with({ stock: book.stock -= quantity })
      return book
    })

    // Emit event when an order has been submitted
    this.after('submitOrder', async (_, req) => {
      let { book, quantity } = req.data
      await this.emit('OrderedBook', { book, quantity, buyer: req.user.id })
    })

    // Delegate requests to the underlying generic service
    return super.init()
  }
}


module.exports = CatalogService
