// src/services/verificationService.js
import { supabase } from '../lib/supabaseClient';

export const submitVerification = async (formData) => {
  try {
    console.log('Submitting verification data:', formData);

    const telegramData = formData.telegramData || {};
    const telegramId = telegramData.id || formData.telegramId;
    
    if (!telegramId) {
      throw new Error('No Telegram ID found');
    }

    // Check if user exists
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (userError) throw userError;

    if (!user) {
      // Create new user with pending verification status
      const userData = {
        telegram_id: telegramId,
        telegram_username: telegramData.username || formData.telegramUsername || null,
        first_name: telegramData.first_name || formData.firstName || 'Unknown',
        last_name: telegramData.last_name || formData.lastName || '',
        photo_url: telegramData.photo_url || null,
        verification_status: 'pending'
      };

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    } else {
      // Update existing user status to pending
      await supabase
        .from('users')
        .update({ verification_status: 'pending' })
        .eq('id', user.id);
    }

    // Upload ID photo
    let idPhotoUrl = null;
    let idPhotoPath = null;
    
    if (formData.idPhoto) {
      const fileExt = formData.idPhoto.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('student-ids')
        .upload(fileName, formData.idPhoto);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('student-ids')
          .getPublicUrl(fileName);

        idPhotoUrl = publicUrl;
        idPhotoPath = fileName;
      }
    }

    // Create verification record
    const verificationData = {
      user_id: user.id,
      university_name: formData.universityName,
      student_id: formData.studentId,
      graduation_year: parseInt(formData.graduationYear),
      gender: formData.gender,
      id_photo_url: idPhotoUrl,
      id_photo_path: idPhotoPath,
      status: 'pending',
      submitted_at: new Date().toISOString()
    };

    const { data: verification, error: verificationError } = await supabase
      .from('student_verifications')
      .insert([verificationData])
      .select();

    if (verificationError) throw verificationError;

    return { 
      success: true, 
      message: 'Verification submitted successfully!', 
      user,
      verification 
    };
  } catch (error) {
    console.error('Error submitting verification:', error);
    return { success: false, message: error.message };
  }
};