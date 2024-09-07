import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc } from './firebase'; // Firestore imports
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function App() {
  const [shoeModel, setShoeModel] = useState(""); // Stocker le modèle de chaussure
  const [colorCode, setColorCode] = useState(""); // Stocker le code couleur de la chaussure
  const [size, setSize] = useState(""); // Stocker la taille de la chaussure
  const [department, setDepartment] = useState(""); // Stocker le département
  const [seller, setSeller] = useState(""); // Stocker le vendeur
  const [requests, setRequests] = useState([]); // Stocker les demandes récupérées

  // Fonction pour ajouter une demande à Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (shoeModel === "" || size === "" || department === "" || seller === "" || colorCode === "") {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      await addDoc(collection(db, "requests"), {
        shoeModel: shoeModel,
        colorCode: colorCode,
        size: size,
        department: department,
        seller: seller,
        status: "En attente" // Statut par défaut lors de l'ajout
      });
      // Réinitialisation des champs du formulaire après l'ajout
      setShoeModel("");
      setColorCode("");
      setSize("");
      setDepartment("");
      setSeller("");
    } catch (error) {
      console.error("Erreur lors de l'envoi des données : ", error);
    }
  };

  // Fonction pour récupérer les demandes de Firestore en temps réel
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "requests"), (snapshot) => {
      const fetchedRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(fetchedRequests);
    });

    return () => unsubscribe(); // Nettoyer l'abonnement Firestore
  }, []);

  // Fonction pour mettre à jour le statut d'une demande
  const handleStatusChange = async (id, newStatus) => {
    try {
      const requestDoc = doc(db, "requests", id);
      await updateDoc(requestDoc, { status: newStatus });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut : ", error);
    }
  };

  // Fonction pour supprimer une demande
  const handleDelete = async (id) => {
    try {
      const requestDoc = doc(db, "requests", id);
      await deleteDoc(requestDoc);
      console.log(`Demande ${id} supprimée`);
    } catch (error) {
      console.error("Erreur lors de la suppression de la demande : ", error);
    }
  };

  // Fonction pour déterminer la couleur de la ligne selon le statut
  const getStatusRowColor = (status) => {
    if (status === "Traité") {
      return "table-success"; // Ligne verte pour "Traité"
    } else if (status === "Indisponible") {
      return "table-danger"; // Ligne rouge pour "Indisponible"
    } else {
      return ""; // Pas de couleur spécifique pour "En attente"
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center my-4">Gestion des Demandes de Chaussures</h1>

      {/* Formulaire de saisie des demandes */}
      <form onSubmit={handleSubmit} className="mb-4 shadow p-4 bg-light rounded">
        <div className="form-group mb-3">
          <label>Modèle de chaussure</label>
          <input
            type="text"
            placeholder="Modèle de chaussure"
            value={shoeModel}
            onChange={(e) => setShoeModel(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group mb-3">
          <label>Code couleur</label>
          <input
            type="text"
            placeholder="Code couleur"
            value={colorCode}
            onChange={(e) => setColorCode(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group mb-3">
          <label>Taille</label>
          <input
            type="text"
            placeholder="Taille"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group mb-3">
          <label>Département</label>
          <input
            type="text"
            placeholder="Département"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group mb-3">
          <label>Vendeur</label>
          <input
            type="text"
            placeholder="Vendeur"
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block">Envoyer la demande</button>
      </form>

      {/* Liste des demandes récupérées */}
      <h2>Demandes en cours</h2>
      {requests.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Modèle</th>
                <th>Code Couleur</th>
                <th>Taille</th>
                <th>Département</th>
                <th>Vendeur</th>
                <th>Statut</th>
                <th>Changer le statut</th>
                <th>Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className={getStatusRowColor(request.status)}>
                  <td>{request.shoeModel}</td>
                  <td>{request.colorCode}</td>
                  <td>{request.size}</td>
                  <td>{request.department}</td>
                  <td>{request.seller}</td>
                  <td>{request.status}</td>
                  <td>
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChange(request.id, e.target.value)}
                      className="form-select"
                    >
                      <option value="En attente">En attente</option>
                      <option value="Traité">Traité</option>
                      <option value="Indisponible">Indisponible</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(request.id)} className="btn btn-danger">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Aucune demande pour le moment.</p>
      )}
    </div>
  );
}

export default App;
