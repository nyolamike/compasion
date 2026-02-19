import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from '@/components/ui/file-upload';
import { registrationLinkService } from '@/lib/registrationLinkService';
import { databaseService } from '@/lib/database';
import { documentUploadService } from '@/lib/documentUploadService';
import { emailService } from '@/lib/emailService';
import { generateRegistrationReference } from '@/lib/registrationUtils';
import { TrainingSession } from '@/types';
import { AlertCircle, Calendar, MapPin, Users, Loader2, Baby, CheckCircle2 } from 'lucide-react';

interface ValidationState {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  trainingSession: TrainingSession | null;
}

interface FormData {
  participantName: string;
  mobileNumber: string;
  emailAddress: string;
  participantPosition: string;
  fcpNumber: string;
  fcpName: string;
  cluster: string;
  region: string;
  attendingWithBaby: boolean;
  nannyApprovalFile: File | null;
  waiverFile: File | null;
  attendanceConfirmed: boolean;
}

interface FormErrors {
  participantName?: string;
  mobileNumber?: string;
  emailAddress?: string;
  participantPosition?: string;
  fcpNumber?: string;
  fcpName?: string;
  cluster?: string;
  region?: string;
  nannyApprovalFile?: string;
  waiverFile?: string;
  attendanceConfirmed?: string;
  duplicate?: string;
}

const PublicRegistration: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: false,
    isLoading: true,
    error: null,
    trainingSession: null,
  });

  const [formData, setFormData] = useState<FormData>({
    participantName: '',
    mobileNumber: '',
    emailAddress: '',
    participantPosition: '',
    fcpNumber: '',
    fcpName: '',
    cluster: '',
    region: '',
    attendingWithBaby: false,
    nannyApprovalFile: null,
    waiverFile: null,
    attendanceConfirmed: false,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    reference: string;
    trainingName: string;
    trainingDate: string;
    facilityName: string;
  } | null>(null);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobileNumber = (mobile: string): boolean => {
    // Basic validation for mobile numbers (10-15 digits, may include +, spaces, dashes)
    const mobileRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return mobileRegex.test(mobile.replace(/[\s\-]/g, ''));
  };

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    if (!value.trim()) {
      return 'This field is required';
    }

    switch (name) {
      case 'emailAddress':
        if (!validateEmail(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'mobileNumber':
        if (!validateMobileNumber(value)) {
          return 'Please enter a valid mobile number';
        }
        break;
      case 'participantName':
        if (value.trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        break;
    }

    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear duplicate error when email or mobile changes
    if ((name === 'emailAddress' || name === 'mobileNumber') && formErrors.duplicate) {
      setFormErrors(prev => ({ ...prev, duplicate: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof FormData, value);
    if (error) {
      setFormErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBabyAttendanceChange = (value: string) => {
    const attendingWithBaby = value === 'yes';
    setFormData(prev => ({ 
      ...prev, 
      attendingWithBaby,
      // Clear files if switching to "no"
      nannyApprovalFile: attendingWithBaby ? prev.nannyApprovalFile : null,
      waiverFile: attendingWithBaby ? prev.waiverFile : null,
    }));
    
    // Clear file errors when switching to "no"
    if (!attendingWithBaby) {
      setFormErrors(prev => ({
        ...prev,
        nannyApprovalFile: undefined,
        waiverFile: undefined,
      }));
    }
  };

  const handleFileChange = (fieldName: 'nannyApprovalFile' | 'waiverFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [fieldName]: file }));
    
    // Clear error for this field when file is selected
    if (file && formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const checkDuplicateRegistration = async (email: string): Promise<boolean> => {
    if (!validationState.trainingSession) return false;
    
    setIsDuplicateChecking(true);
    try {
      const existingRegistration = await databaseService.getRegistrationByEmail(
        email,
        validationState.trainingSession.id
      );
      return existingRegistration !== null;
    } catch (error) {
      console.error('Error checking duplicate registration:', error);
      return false;
    } finally {
      setIsDuplicateChecking(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    // Validate text fields
    (Object.keys(formData) as Array<keyof FormData>).forEach(key => {
      // Skip file, boolean, and checkbox fields
      if (key === 'nannyApprovalFile' || key === 'waiverFile' || key === 'attendingWithBaby' || key === 'attendanceConfirmed') {
        return;
      }
      const error = validateField(key, formData[key] as string);
      if (error) {
        errors[key] = error;
      }
    });

    // Validate baby-related documents if attending with baby
    if (formData.attendingWithBaby) {
      if (!formData.nannyApprovalFile) {
        errors.nannyApprovalFile = 'Nanny approval document is required when attending with a baby';
      }
      if (!formData.waiverFile) {
        errors.waiverFile = 'Waiver of liability document is required when attending with a baby';
      }
    }

    // Validate attendance confirmation
    if (!formData.attendanceConfirmed) {
      errors.attendanceConfirmed = 'You must confirm your attendance to complete registration';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateForm()) {
      return;
    }

    // Check for duplicate registration
    const isDuplicate = await checkDuplicateRegistration(formData.emailAddress);
    if (isDuplicate) {
      setFormErrors(prev => ({
        ...prev,
        duplicate: 'You have already registered for this training session. Please check your email for confirmation details.',
      }));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get the registration link
      const registrationLink = await databaseService.getRegistrationLinkByToken(token!);
      if (!registrationLink) {
        throw new Error('Registration link not found');
      }

      // Upload documents if attending with baby
      let nannyApprovalPath: string | undefined;
      let waiverPath: string | undefined;

      if (formData.attendingWithBaby) {
        setIsUploadingDocuments(true);

        // Generate a temporary registration ID for file organization
        const tempRegistrationId = `temp_${Date.now()}`;

        // Upload nanny approval document
        if (formData.nannyApprovalFile) {
          const nannyResult = await documentUploadService.uploadDocument(
            formData.nannyApprovalFile,
            tempRegistrationId,
            'nanny_approval'
          );

          if (!nannyResult.success) {
            setFormErrors(prev => ({
              ...prev,
              nannyApprovalFile: nannyResult.error || 'Failed to upload nanny approval document',
            }));
            setIsUploadingDocuments(false);
            setIsSubmitting(false);
            return;
          }

          nannyApprovalPath = nannyResult.filePath;
        }

        // Upload waiver document
        if (formData.waiverFile) {
          const waiverResult = await documentUploadService.uploadDocument(
            formData.waiverFile,
            tempRegistrationId,
            'waiver_liability'
          );

          if (!waiverResult.success) {
            setFormErrors(prev => ({
              ...prev,
              waiverFile: waiverResult.error || 'Failed to upload waiver document',
            }));
            setIsUploadingDocuments(false);
            setIsSubmitting(false);
            return;
          }

          waiverPath = waiverResult.filePath;
        }

        setIsUploadingDocuments(false);
      }

      // Generate registration reference
      const registrationReference = generateRegistrationReference();

      // Create participant registration
      const registration = await databaseService.createParticipantRegistration({
        registration_link_id: registrationLink.id,
        training_session_id: validationState.trainingSession!.id,
        participant_name: formData.participantName,
        mobile_number: formData.mobileNumber,
        email_address: formData.emailAddress,
        participant_position: formData.participantPosition,
        fcp_number: formData.fcpNumber,
        fcp_name: formData.fcpName,
        cluster: formData.cluster,
        region: formData.region,
        attending_with_baby: formData.attendingWithBaby,
        nanny_approval_document: nannyApprovalPath,
        waiver_document: waiverPath,
        attendance_confirmed: formData.attendanceConfirmed,
        registration_reference: registrationReference,
        registered_at: new Date().toISOString(),
      });

      // Create document records if files were uploaded
      if (nannyApprovalPath && formData.nannyApprovalFile) {
        await databaseService.createUploadedDocument({
          registration_id: registration.id,
          document_type: 'nanny_approval',
          file_name: formData.nannyApprovalFile.name,
          file_path: nannyApprovalPath,
          file_size: formData.nannyApprovalFile.size,
          mime_type: formData.nannyApprovalFile.type,
          uploaded_at: new Date().toISOString(),
        });
      }

      if (waiverPath && formData.waiverFile) {
        await databaseService.createUploadedDocument({
          registration_id: registration.id,
          document_type: 'waiver_liability',
          file_name: formData.waiverFile.name,
          file_path: waiverPath,
          file_size: formData.waiverFile.size,
          mime_type: formData.waiverFile.type,
          uploaded_at: new Date().toISOString(),
        });
      }

      // Update link analytics
      const analytics = await databaseService.getLinkAnalytics(registrationLink.id);
      if (analytics) {
        await databaseService.updateLinkAnalytics(registrationLink.id, {
          total_registrations: analytics.total_registrations + 1,
          conversion_rate: ((analytics.total_registrations + 1) / analytics.total_views) * 100,
        });
      }

      // Send confirmation email
      const emailResult = await emailService.sendRegistrationConfirmation({
        participantName: formData.participantName,
        participantEmail: formData.emailAddress,
        registrationReference: registrationReference,
        trainingName: validationState.trainingSession!.trainingName,
        trainingDate: validationState.trainingSession!.date,
        facilityName: validationState.trainingSession!.facilityName,
        format: validationState.trainingSession!.format,
        attendingWithBaby: formData.attendingWithBaby,
        mobileNumber: formData.mobileNumber,
        fcpName: formData.fcpName,
        cluster: formData.cluster,
        region: formData.region,
      });

      // Log email result (don't fail registration if email fails)
      if (emailResult.success) {
        if (emailResult.demoMode) {
          console.log('✅ Demo email logged successfully');
        } else {
          console.log('✅ Confirmation email sent successfully');
        }
      } else {
        console.error('⚠️ Failed to send confirmation email:', emailResult.error);
        // Note: We don't fail the registration if email fails
      }

      // Set success state
      setRegistrationSuccess({
        reference: registrationReference,
        trainingName: validationState.trainingSession!.trainingName,
        trainingDate: validationState.trainingSession!.date,
        facilityName: validationState.trainingSession!.facilityName,
      });

      setIsSubmitting(false);
    } catch (error) {
      console.error('Error during form submission:', error);
      setFormErrors(prev => ({
        ...prev,
        duplicate: 'An unexpected error occurred. Please try again.',
      }));
      setIsSubmitting(false);
      setIsUploadingDocuments(false);
    }
  };

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setValidationState({
          isValid: false,
          isLoading: false,
          error: 'Invalid registration link. No token provided.',
          trainingSession: null,
        });
        return;
      }

      try {
        const result = await registrationLinkService.validateLink(token);
        
        if (!result.isValid) {
          setValidationState({
            isValid: false,
            isLoading: false,
            error: result.error || 'This registration link is invalid or has expired.',
            trainingSession: null,
          });
          return;
        }

        setValidationState({
          isValid: true,
          isLoading: false,
          error: null,
          trainingSession: result.trainingSession!,
        });
      } catch (error) {
        console.error('Error validating registration link:', error);
        setValidationState({
          isValid: false,
          isLoading: false,
          error: 'An error occurred while validating the registration link. Please try again later.',
          trainingSession: null,
        });
      }
    };

    validateToken();
  }, [token]);

  if (validationState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!validationState.isValid || validationState.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Registration Link Invalid
            </CardTitle>
            <CardDescription>
              We couldn't validate your registration link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationState.error}</AlertDescription>
            </Alert>
            <div className="mt-6 text-sm text-gray-600">
              <p>If you believe this is an error, please contact the trainer who shared this link with you.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { trainingSession } = validationState;

  // Show success page if registration is complete
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-green-600">Registration Successful!</CardTitle>
                  <CardDescription>Your registration has been confirmed</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Registration Reference */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Registration Reference Number</p>
                <p className="text-2xl font-bold text-blue-600">{registrationSuccess.reference}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Please save this reference number for your records
                </p>
              </div>

              {/* Training Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Training Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium">{registrationSuccess.trainingName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div>
                      <p>
                        {new Date(registrationSuccess.trainingDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div>
                      <p>{registrationSuccess.facilityName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Next Steps</h3>
                
                {/* Demo Mode Notice */}
                {emailService.isDemo() && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertDescription className="text-sm">
                      <strong>Demo Mode:</strong> Email notifications are currently disabled. 
                      In production, a confirmation email would be sent to your registered email address.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Alert>
                  <AlertDescription className="text-sm space-y-2">
                    <p>
                      <strong>Confirmation Email:</strong> {emailService.isDemo() 
                        ? 'In production mode, a confirmation email would be sent to your registered email address with all the training details.'
                        : 'A confirmation email has been sent to your registered email address with all the training details.'}
                    </p>
                    <p>
                      <strong>Attendance:</strong> Please arrive at least 15 minutes before the training starts.
                    </p>
                    <p>
                      <strong>Questions:</strong> If you have any questions, please contact the trainer who shared the registration link with you.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>

              {/* Additional Information for Baby Attendance */}
              {formData.attendingWithBaby && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Baby className="h-5 w-5" />
                    Baby Attendance
                  </h3>
                  <Alert>
                    <AlertDescription className="text-sm">
                      Your documents have been uploaded successfully. The trainer will review your nanny approval and waiver forms before the training session.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  Register Another Participant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Training Session Registration</CardTitle>
            <CardDescription>
              Please complete the form below to register for this training session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Training Session Details */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-lg mb-3">{trainingSession!.trainingName}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span>
                    {new Date(trainingSession!.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span>{trainingSession!.facilityName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span>{trainingSession!.format}</span>
                </div>
              </div>
              
              {trainingSession!.format === 'In-Person' && (
                <Alert className="mt-4">
                  <AlertDescription className="text-sm">
                    <strong>Important:</strong> By registering for this in-person training, you are committing to attend.
                    Please ensure you can attend before completing this registration.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Duplicate Registration Error */}
              {formErrors.duplicate && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formErrors.duplicate}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                {/* Participant Name */}
                <div className="space-y-2">
                  <Label htmlFor="participantName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="participantName"
                    name="participantName"
                    type="text"
                    value={formData.participantName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter your full name"
                    className={formErrors.participantName ? 'border-red-500' : ''}
                  />
                  {formErrors.participantName && (
                    <p className="text-sm text-red-500">{formErrors.participantName}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter your mobile number"
                    className={formErrors.mobileNumber ? 'border-red-500' : ''}
                  />
                  {formErrors.mobileNumber && (
                    <p className="text-sm text-red-500">{formErrors.mobileNumber}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <Label htmlFor="emailAddress">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="emailAddress"
                    name="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email address"
                    className={formErrors.emailAddress ? 'border-red-500' : ''}
                  />
                  {formErrors.emailAddress && (
                    <p className="text-sm text-red-500">{formErrors.emailAddress}</p>
                  )}
                </div>

                {/* Participant Position */}
                <div className="space-y-2">
                  <Label htmlFor="participantPosition">
                    Position <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="participantPosition"
                    name="participantPosition"
                    type="text"
                    value={formData.participantPosition}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter your position/role"
                    className={formErrors.participantPosition ? 'border-red-500' : ''}
                  />
                  {formErrors.participantPosition && (
                    <p className="text-sm text-red-500">{formErrors.participantPosition}</p>
                  )}
                </div>
              </div>

              {/* FCP Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">FCP Information</h3>
                
                {/* FCP Number */}
                <div className="space-y-2">
                  <Label htmlFor="fcpNumber">
                    FCP Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fcpNumber"
                    name="fcpNumber"
                    type="text"
                    value={formData.fcpNumber}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter FCP number"
                    className={formErrors.fcpNumber ? 'border-red-500' : ''}
                  />
                  {formErrors.fcpNumber && (
                    <p className="text-sm text-red-500">{formErrors.fcpNumber}</p>
                  )}
                </div>

                {/* FCP Name */}
                <div className="space-y-2">
                  <Label htmlFor="fcpName">
                    FCP Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fcpName"
                    name="fcpName"
                    type="text"
                    value={formData.fcpName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter FCP name"
                    className={formErrors.fcpName ? 'border-red-500' : ''}
                  />
                  {formErrors.fcpName && (
                    <p className="text-sm text-red-500">{formErrors.fcpName}</p>
                  )}
                </div>

                {/* Cluster */}
                <div className="space-y-2">
                  <Label htmlFor="cluster">
                    Cluster <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cluster"
                    name="cluster"
                    type="text"
                    value={formData.cluster}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter cluster"
                    className={formErrors.cluster ? 'border-red-500' : ''}
                  />
                  {formErrors.cluster && (
                    <p className="text-sm text-red-500">{formErrors.cluster}</p>
                  )}
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <Label htmlFor="region">
                    Region <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="region"
                    name="region"
                    type="text"
                    value={formData.region}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Enter region"
                    className={formErrors.region ? 'border-red-500' : ''}
                  />
                  {formErrors.region && (
                    <p className="text-sm text-red-500">{formErrors.region}</p>
                  )}
                </div>
              </div>

              {/* Baby Attendance Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Baby className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">Baby Attendance</h3>
                </div>
                
                <div className="space-y-3">
                  <Label>
                    Are you attending with a baby under 1 year old? <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.attendingWithBaby ? 'yes' : 'no'}
                    onValueChange={handleBabyAttendanceChange}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="baby-yes" />
                      <Label htmlFor="baby-yes" className="font-normal cursor-pointer">
                        Yes, I will be attending with a baby
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="baby-no" />
                      <Label htmlFor="baby-no" className="font-normal cursor-pointer">
                        No, I will not be attending with a baby
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Document Upload Section - Only shown if attending with baby */}
                {formData.attendingWithBaby && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                    <Alert>
                      <AlertDescription className="text-sm">
                        <strong>Required Documents:</strong> If you are attending with a baby under 1 year old, 
                        you must upload both a nanny approval form and a waiver of liability form.
                      </AlertDescription>
                    </Alert>

                    {/* Nanny Approval Document */}
                    <FileUpload
                      id="nannyApprovalFile"
                      label="Nanny Approval Form"
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize={5 * 1024 * 1024}
                      value={formData.nannyApprovalFile}
                      onChange={(file) => handleFileChange('nannyApprovalFile', file)}
                      error={formErrors.nannyApprovalFile}
                      required
                      disabled={isSubmitting || isUploadingDocuments}
                    />

                    {/* Waiver of Liability Document */}
                    <FileUpload
                      id="waiverFile"
                      label="Waiver of Liability Form"
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize={5 * 1024 * 1024}
                      value={formData.waiverFile}
                      onChange={(file) => handleFileChange('waiverFile', file)}
                      error={formErrors.waiverFile}
                      required
                      disabled={isSubmitting || isUploadingDocuments}
                    />
                  </div>
                )}
              </div>

              {/* Attendance Confirmation Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Attendance Confirmation</h3>
                
                {trainingSession!.format === 'In-Person' && (
                  <Alert className="mb-4">
                    <AlertDescription className="text-sm">
                      <strong>Important Commitment:</strong> By confirming your attendance for this in-person training, 
                      you are making a commitment to attend. Please only register if you are certain you can attend, 
                      as your spot could otherwise be given to another participant.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Checkbox
                    id="attendanceConfirmed"
                    checked={formData.attendanceConfirmed}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({ ...prev, attendanceConfirmed: checked as boolean }));
                      if (checked && formErrors.attendanceConfirmed) {
                        setFormErrors(prev => ({ ...prev, attendanceConfirmed: undefined }));
                      }
                    }}
                    disabled={isSubmitting || isUploadingDocuments}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="attendanceConfirmed"
                      className="text-sm font-medium cursor-pointer"
                    >
                      I confirm that I will attend this training session <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      I understand that by confirming my attendance, I am committing to participate in the training 
                      and will notify the trainer if I am unable to attend.
                    </p>
                    {formErrors.attendanceConfirmed && (
                      <p className="text-sm text-red-500 mt-2">{formErrors.attendanceConfirmed}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isDuplicateChecking || isUploadingDocuments}
                  className="w-full sm:w-auto"
                >
                  {isUploadingDocuments ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading Documents...
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Registration...
                    </>
                  ) : isDuplicateChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicRegistration;
