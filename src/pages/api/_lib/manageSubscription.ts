import { fauna } from "../../../services/faunadb";
import { query as q } from 'faunadb'
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false,
) {
  //buscar o user no fauna com o customerId do stripe
  const userRef = await fauna.query(
    q.Select(
      "ref",
      q.Get(
        q.Match(
          q.Index('user_by_stripe_customer_id'),
          customerId
        )
      )
    )
  )

  //salvar os dados da subscription no banco e dados
  // identifica a subscription no stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        
  // dados da subscription de interesse para salvar no banco de dados
  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  }

  // verifica se a ação é de Edição ou Remoção
  if (createAction) {
    await fauna.query(
      q.Create(
        q.Collection('subscriptions'),
        {
          data: subscriptionData 
        }
      )
    )
  } else {
    await fauna.query(
      q.Replace(
        q.Select(
          "ref",
          q.Get(
            q.Match(
              q.Index('subscription_by_id'),
              subscriptionId,
            )
          )
        ),
        { data: subscriptionData }
      )
    )
  }
}