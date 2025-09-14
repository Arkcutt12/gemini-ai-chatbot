import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { supabase } from "../lib/supabase/server";

import { User } from "./schema";

export async function getUser(email: string): Promise<Array<User>> {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', email);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    const { data, error } = await supabase
      .from('User')
      .insert({ email, password: hash })
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const { data: existingChat } = await supabase
      .from('Chat')
      .select('*')
      .eq('id', id)
      .single();

    if (existingChat) {
      const { data, error } = await supabase
        .from('Chat')
        .update({ messages: JSON.stringify(messages) })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase
      .from('Chat')
      .insert({
        id,
        createdAt: new Date().toISOString(),
        messages: JSON.stringify(messages),
        userId,
      })
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    const { data, error } = await supabase
      .from('Chat')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    const { data, error } = await supabase
      .from('Chat')
      .select('*')
      .eq('userId', id)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const { data, error } = await supabase
      .from('Chat')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  const { data, error } = await supabase
    .from('Reservation')
    .insert({
      id,
      createdAt: new Date().toISOString(),
      userId,
      hasCompletedPayment: false,
      details: JSON.stringify(details),
    })
    .select();
  
  if (error) throw error;
  return data;
}

export async function getReservationById({ id }: { id: string }) {
  const { data, error } = await supabase
    .from('Reservation')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string;
  hasCompletedPayment: boolean;
}) {
  const { data, error } = await supabase
    .from('Reservation')
    .update({ hasCompletedPayment })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data;
}
