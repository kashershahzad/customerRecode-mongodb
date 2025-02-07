'use client'

import { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar } from '@mui/material';
import Form from '@/app/components/form';

export default function Page() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Active');
  const [billPrice, setBillPrice] = useState('');
  const [customers, setCustomers] = useState([]);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch customers from the API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customerdata`);
        const data = await response.json();
        if (response.ok) {
          setCustomers(data.map(customer => ({
            id: customer.id,
            name: customer.name,
            status: customer.status ? 'Paid' : 'Unpaid',
            billPrice: `$${customer.price}`
          })));
        } else {
          setMessage('Failed to fetch customers.');
          setOpenSnackbar(true);
        }
      } catch (error) {
        setMessage('Error: ' + error.message);
        setOpenSnackbar(true);
      } finally {
        setIsLoading(false); // Set loading to false when done
      }
    };

    fetchCustomers();
  }, []);

  const handleClickOpen = () => {
    setEditingCustomer(null);
    setName('');
    setStatus('Active');
    setBillPrice('');
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleAddCustomer = async () => {
    if (name && billPrice) {
      const customerData = {
        name,
        status: status === 'Active',
        billPrice: parseFloat(billPrice),
      };

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customerdata`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });

        const data = await response.json();

        if (response.ok) {
          setCustomers([
            ...customers,
            { id: data.id, name, status, billPrice: `$${billPrice}` },
          ]);
          setMessage('Customer added successfully!');
        } else {
          setMessage(data.message || 'Failed to add customer.');
        }
      } catch (error) {
        setMessage('Error: ' + error.message);
      }

      setName('');
      setStatus('Active');
      setBillPrice('');
      handleClose();
      setOpenSnackbar(true);
    }
  };

  const handleUpdateCustomer = async () => {
    if (editingCustomer && name && billPrice) {
      const customerData = {
        id: editingCustomer.id,
        name,
        status: status === 'Active',
        billPrice: parseFloat(billPrice),
      };

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customerdata`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });

        const data = await response.json();

        if (response.ok) {
          setCustomers(customers.map(customer =>
            customer.id === editingCustomer.id ? { ...customer, name, status, billPrice: `$${billPrice}` } : customer
          ));
          setMessage('Customer updated successfully!');
        } else {
          setMessage(data.message || 'Failed to update customer.');
        }
      } catch (error) {
        setMessage('Error: ' + error.message);
      }

      setName('');
      setStatus('Active');
      setBillPrice('');
      handleClose();
      setOpenSnackbar(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customerdata`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (response.ok) {
        setCustomers(customers.filter(customer => customer.id !== id));
        setMessage('Customer deleted successfully!');
      } else {
        setMessage(data.message || 'Failed to delete customer.');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
    setOpenSnackbar(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setStatus(customer.status);
    setBillPrice(customer.billPrice.replace('$', ''));
    setOpen(true);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h1 className='text-3xl font-bold m-10'>All Customer Records</h1>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        New Customer+
      </Button>

      <Form
        open={open}
        handleClose={handleClose}
        name={name}
        setName={setName}
        status={status}
        setStatus={setStatus}
        billPrice={billPrice}
        setBillPrice={setBillPrice}
        handleAddCustomer={handleAddCustomer}
        handleUpdateCustomer={handleUpdateCustomer}
        editingCustomer={editingCustomer}
      />

      <TableContainer component={Paper} className="mt-6 w-full max-w-2xl">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Bill Price</TableCell>
              <TableCell>Update Records</TableCell>
              <TableCell>Delete Records</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.status}</TableCell>
                  <TableCell>{customer.billPrice}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleEdit(customer)}>
                      Update
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" color="error" onClick={() => handleDelete(customer.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={message}
      />
    </div>
  );
}