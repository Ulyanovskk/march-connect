# Configuration de la Confirmation d'Email Supabase

## Problème
Lorsque vous cliquez sur le lien de confirmation d'email de Supabase, vous êtes redirigé vers `http://localhost:8080/#` au lieu de votre application.

## Solution Implémentée

### 1. Page de Callback Créée
Une nouvelle page `AuthCallback.tsx` a été créée pour gérer les confirmations d'email et les récupérations de mot de passe.

### 2. Route Ajoutée
La route `/auth/callback` a été ajoutée dans `App.tsx`.

## Configuration Requise dans Supabase

### Étapes à Suivre :

1. **Connectez-vous à Supabase** :
   - Visitez : https://supabase.com/dashboard/project/mhbhzbgxyjqkokilxpfw
   
2. **Accédez aux Paramètres d'Authentification** :
   - Cliquez sur **Settings** (icône d'engrenage) dans la barre latérale
   - Sélectionnez **Authentication** dans le menu
   
3. **Configurez les URLs de Redirection** :
   - Faites défiler jusqu'à la section **URL Configuration**
   - Dans le champ **Site URL**, assurez-vous qu'il est défini sur :
     ```
     http://localhost:5173
     ```
   
   - Dans le champ **Redirect URLs**, ajoutez les URLs suivantes (une par ligne) :
     ```
     http://localhost:5173/auth/callback
     http://localhost:8080/auth/callback
     http://localhost:3000/auth/callback
     ```
   
4. **Sauvegardez les Modifications** :
   - Cliquez sur **Save** en bas de la page

### Configuration Email Templates (Recommandé)

Pour améliorer l'expérience utilisateur, vous pouvez personnaliser le template d'email :

1. Dans **Authentication** → **Email Templates**
2. Sélectionnez **Confirm signup**
3. Modifiez l'URL de confirmation pour utiliser :
   ```
   {{ .SiteURL }}/auth/callback#access_token={{ .Token }}&type=signup
   ```

## Test de la Configuration

Après avoir configuré Supabase :

1. Créez un nouveau compte sur votre application
2. Vérifiez votre email
3. Cliquez sur le lien de confirmation
4. Vous devriez être redirigé vers `http://localhost:5173/auth/callback`
5. Un message de succès devrait apparaître
6. Vous serez automatiquement redirigé vers la page de connexion

## Dépannage

### Si la redirection ne fonctionne toujours pas :

1. **Vérifiez que votre application tourne sur le bon port** :
   - La commande `npm run dev` devrait afficher le port utilisé
   - Par défaut, Vite utilise le port 5173

2. **Vérifiez les URLs dans Supabase** :
   - Assurez-vous que les URLs sont exactement comme indiqué ci-dessus
   - Pas d'espace supplémentaire ou de slash à la fin

3. **Videz le cache de votre navigateur** :
   - Ou testez en navigation privée

4. **Vérifiez la console du navigateur** :
   - Ouvrez les outils de développement (F12)
   - Recherchez les erreurs dans la console

## Notes Importantes

- Les URLs `localhost` ne fonctionnent qu'en développement
- Pour la production, vous devrez ajouter votre domaine réel dans les Redirect URLs
- Le port par défaut de Vite (5173) peut changer si le port est déjà utilisé
