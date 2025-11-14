// DTO para crear un comentario
export interface ComentarDTO {
  texto: string;
  calificacion: number;
  idAlojamiento: number;
}

// DTO de comentario
export interface ComentarioDTO {
  id: number;
  texto: string;
  calificacion: number;
  fecha: string; // ISO string
  nombreHuesped: string;
  nombreAnfitrion: string;
  fotoHuesped: string;
  fotoAnfitrion: string;
  textoRespuesta: string;

}

// DTO para responder a un comentario
export interface ResponderDTO {
  respuesta: string;
  idComentario: number;
}

// DTO de respuesta
export interface RespuestaDTO {
  id: number;
  idComentario: number;
  respuesta: string;
  fecha: string; // ISO string

}
