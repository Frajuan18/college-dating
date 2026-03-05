// src/services/verificationService.js
import { supabase } from '../lib/supabaseClient';

export const submitVerification = async (formData) => {
  try {
    console.log('Submitting verification data:', formData);

    // First, check if user exists or create new user
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', formData.telegramData?.id || formData.telegramId)
      .single();

    if (userError && userError.code === 'PGRST116') {
      // User doesn't exist, create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          telegram_id: formData.telegramData?.id || formData.telegramId,
          telegram_username: formData.telegramData?.username || formData.telegramUsername,
          first_name: formData.telegramData?.first_name || formData.firstName,
          last_name: formData.telegramData?.last_name || formData.lastName,
          photo_url: formData.telegramData?.photo_url
        }])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    } else if (userError) {
      throw userError;
    }

    // Upload ID photo if exists
    let idPhotoUrl = null;
    let idPhotoPath = null;
    
    if (formData.idPhoto) {
      try {
        // Generate a unique filename
        const fileName = `${user.id}/${Date.now()}_${formData.idPhoto.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        
        const { error: uploadError } = await supabase.storage
          .from('student-ids')
          .upload(fileName, formData.idPhoto);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          if (uploadError.message.includes('bucket')) {
            console.warn('Storage bucket not configured, continuing without photo');
          } else {
            throw uploadError;
          }
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('student-ids')
            .getPublicUrl(fileName);

          idPhotoUrl = publicUrl;
          idPhotoPath = fileName; // Save the path for later deletion
        }
      } catch (uploadError) {
        console.error('Photo upload failed:', uploadError);
        // Continue without photo
      }
    }

    // Create verification record with photo path
    const { data: verification, error: verificationError } = await supabase
      .from('student_verifications')
      .insert([{
        user_id: user.id,
        university_name: formData.universityName,
        student_id: formData.studentId,
        graduation_year: formData.graduationYear,
        gender: formData.gender,
        id_photo_url: idPhotoUrl,
        id_photo_path: idPhotoPath, // Save path for deletion
        status: 'pending'
      }])
      .select();

    if (verificationError) throw verificationError;

    return { 
      success: true, 
      message: 'Verification submitted successfully! Your ID photo will be deleted after review.', 
      verification 
    };
  } catch (error) {
    console.error('Error submitting verification:', error);
    return { success: false, message: error.message };
  }
};