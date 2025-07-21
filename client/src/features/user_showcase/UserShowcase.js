import React from 'react';
import { Link } from 'react-router-dom';

import './assets/css/user_search.min.css';

export default function UserShowcase({ users }) {
  return (
    <div className="user-showcase">
      <div className="d-flex justify-content-center">
        <table className="border table">
          <thead className="table-header">
            <tr>
              <th className="user-showcase__id py-4 px-4 text-center border-end">User id</th>
              <th className="user-showcase__username py-4 px-4 text-center border-end">Όνομα χρήστη</th>
              <th className="user-showcase__role py-4 px-4 text-center border-end">Ρόλος</th>
              <th className="user-showcase__role-request py-4 px-4 text-center border-end">Αίτηση</th>
              <th className="user-showcase__actions py-4 px-4 text-center">Ενέργειες</th>
            </tr>
          </thead>

          <tbody>
            {
              Object.keys(users).map((keyName, index) => {
                const user = users[keyName];

                let userRole;
                switch (user.role) {
                  case "admin":
                    userRole = "Διαχειριστής";
                    break;
                  case "host":
                    userRole = "Οικοδεσπότης";
                    break;
                  case "client":
                    userRole = "Ενοικιαστής";
                    break;
                }

                let approvalStatus;
                switch (user.status) {
                  case "accepted":
                    approvalStatus = "Επιτυχής";
                    break;
                  case "rejected":
                    approvalStatus = "Απορρίφθηκε";
                    break;
                  case "pending":
                    approvalStatus = "Εκκρεμεί";
                    break;
                }

                return (
                  <tr key={index}>
                    {
                      index != 0 &&
                      <td className="user-showcase__user-separator py-4 px-4 text-end text-md-center border-top border-end d-block d-md-none">

                      </td>
                    }

                    <td className="user-showcase__id py-4 px-4 text-end text-md-center border-top border-end d-block d-md-table-cell" data-title="User id">
                      {user.id}
                    </td>

                    <td className="user-showcase__username py-4 px-4 text-end text-md-center border-top  border-end d-block d-md-table-cell" data-title="Όνομα χρήστη">
                      {user.username}
                    </td>

                    <td className="user-showcase__role py-4 px-4 text-end text-md-center border-top border-end d-block d-md-table-cell" data-title="Ρόλος">
                      {userRole}
                    </td>

                    <td className="user-showcase__role-request py-4 px-4 text-end text-md-center border-top border-end d-block d-md-table-cell" data-title="Αίτηση">
                      {
                        ((user.role == "host") ? approvalStatus : "-")
                      }
                    </td>

                    <td className="user-showcase__actions py-4 px-4 text-end text-md-center border-top d-block d-md-table-cell" data-title="Ενέργειες">
                      <Link to={"/user/" + user.id} className="user-showcase__more-button">
                        <p className="mb-0">
                          Περισσότερα
                        </p>
                      </Link>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
