// pages/payment.js
import { useEffect, useState } from 'react';
import { Wallet } from 'ethers';
import {
  approveErc20,
  hasErc20Approval,
  hasSufficientFunds,
  payRequest,
} from '@requestnetwork/payment-processor';
import { RequestNetwork } from '@requestnetwork/request-client.js';

export default function PaymentPage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const wallet = Wallet.createRandom();
    const requestNetwork = new RequestNetwork();

    const processPayment = async () => {
      try {
        const account = wallet.address;

        const request = await requestNetwork.fromRequestId('REQUEST_ID');
        const requestData = await request.getData();

        if (!(await hasSufficientFunds({ request: requestData, address: account }))) {
          setMessage('You do not have enough funds to pay this request');
          return;
        }
        if (!(await hasErc20Approval(requestData, account))) {
          const approvalTx = await approveErc20(requestData, wallet);
          await approvalTx.wait(1);
        }

        const tx = await payRequest(requestData, wallet);
        await tx.wait(1);
        setMessage('Payment successful');
      } catch (error) {
        console.log(error);
      }
    };

    processPayment();
  }, []);

  return (
    <div>
      <h1>Payment Page</h1>
      <p>{message}</p>
    </div>
  );
}
