declare namespace Express {
    // Defina a estrutura do seu objeto de utilizador (User)
    interface User {
        id: string; 
        email: String;
        password: String;
        name: String;
        avatar: String;
    }

    // Estenda a interface Request
    interface Request {
        user?: User; // Torne 'user' opcional, a menos que você tenha certeza que o middleware será sempre executado
    }
}