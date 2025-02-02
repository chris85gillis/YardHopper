import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "react-native-calendars";
import { useAuth } from "@/components/AuthProvider";
import { useImagePicker } from "@/hooks/useImagePicker";

// // Mock data (replace with actual data fetching in a real app)
// const mockSale = {
//   id: '1',
//   title: 'Yard Sale 1',
//   description: 'Furniture, clothes, and more!',
//   image: require('@/assets/images/sale1.png'),
//   startDate: new Date().toISOString().split('T')[0],
//   endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
//   startTime: new Date(),
//   endTime: new Date(Date.now() + 3600000),
//   categories: ['Furniture', 'Clothing'],
// };

type ListingItem = {
  title: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  dates: string[];
  startTime: string;
  endTime: string;
  images: { uri: string }[];
  categories: string[];
  status: string;
};

const allCategories = [
  "Decor & Art",
  "Clothing",
  "Shoes & Accessories",
  "Pet",
  "Tools/Parts",
  "Kitchenware",
  "Textiles",
  "Furniture",
  "Books & Media",
  "Seasonal/Holiday",
  "Appliances",
  "Electronics",
  "Hobbies",
  "Sports/Outdoors",
  "Kids",
  "Other",
];

export default function SaleDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sale, setSale] = useState<ListingItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [idToken, setIdToken] = useState<string>("");
  const { image, mimeType, openImagePicker, reset } = useImagePicker();

  const { getValidIdToken, user } = useAuth();
  const [startTime, setStartTime] = useState(
    sale?.startTime ? new Date(`1970-01-01T${sale?.startTime}:00`) : new Date()
  );
  const [endTime, setEndTime] = useState(
    sale?.endTime
      ? new Date(`1970-01-01T${sale?.endTime}:00`)
      : new Date(new Date().getTime() + 60 * 60 * 1000)
  );
  const [currentPicker, setCurrentPicker] = useState<"start" | "end" | null>(
    null
  );
  //   const [updatedSale, setUpdatedSale] = useState<ListingItem | null>
  // //   const [startDate, setStartDate] = useState(sale.startDate);
  //   const [dates, setDates] = useState(sale.dates);
  //   const [startTime, setStartTime] = useState(sale.startTime);
  //   const [endTime, setEndTime] = useState(sale.endTime);
  const [selectedCategories, setSelectedCategories] = useState(
    new Set(sale?.categories)
  );
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  //   const [listing, setListing] = useState<ListingItem | null>(null);
  // const [startDate, setStartDate] = useState(sale?.dates?.[0]);
  // const [endDate, setEndDate] = useState(sale?.dates?.[sale.dates.length - 1]);

  const fetchSale = async () => {
    try {
      let url = `https://yardhopperapi.onrender.com/api/listings/${id}`;
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();

      const saleData = Array.isArray(data) ? data[0] : data;
    //   console.log(saleData.listing);

      if (saleData.listing) {
        setSale({
          title: saleData.listing.title,
          description: saleData.listing.description,
          address: {
            street: saleData.listing.address.street,
            city: saleData.listing.address.city,
            state: saleData.listing.address.state,
            zip: saleData.listing.address.zip,
          },
          dates: saleData.listing.dates || [],
          startTime: saleData.listing.startTime || "",
          endTime: saleData.listing.endTime || "",
          images: saleData.listing.images || null, // Handle null images
          categories: saleData.listing.categories || [],
          status: saleData.listing.status,
        });
      } else {
        setSale(null);
        console.error("Unable to retrieve sale data.");
        return;
      }
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const getToken = async () => {
    const token = await getValidIdToken();
    if (!token) {
      console.error(
        "Unable to retrieve ID token. User might not be authenticated."
      );
      return;
    } else {
      setIdToken(token);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (loading) {
          console.warn(
            "Fetch already in progress, skipping duplicate request..."
          );
          return;
        }
        setLoading(true);
        await getToken();
        await fetchSale();
      } catch (error) {
        Alert.alert("Error", (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleUpdateSale = async () => {
    if (!sale) return;

    try {
      setLoading(true);
      const updatedSale = {
        ...sale,
      };
      let url = `https://yardhopperapi.onrender.com/api/listings/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSale),
      });
      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text(); // Get detailed error message
        console.error("Server error:", errorText);
        throw new Error("Failed to update sale");
      }

      // If update was successful, show success message
      const responseData = await response.json(); // Get the response data

    //   console.log("Updated Sale:", responseData);
      Alert.alert("Success", "Sale updated successfully");

      // Redirect or update UI
      router.push({
        pathname: "../mylistings",
      });
    } catch (error) {
      // Handle errors
      Alert.alert("Error", (error as Error).message || "Failed to update sale");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSale((prev) => {
      if (!prev) return null;

      const keys = field.split("."); // Split field name for nested updates
      if (keys.length === 1) {
        // Top-level field update
        return {
          ...prev,
          [field]: value,
        };
      } else {
        // Nested field update
        let updatedSale = { ...prev };
        let current = updatedSale;

        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] }; // Clone nested objects
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value; // Set the value at the last key
        return updatedSale;
      }
    });
  };

  const handleDeleteSale = async () => {
    if (!sale) return;

    Alert.alert(
      "Warning",
      "Are you sure you want to permanently delete this sale? You can always archive it for later.",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setLoading(true);
              const url = `https://yardhopperapi.onrender.com/api/listings/${id}`;
              const response = await fetch(url, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${idToken}` },
              });
              if (!response.ok) throw new Error("Failed to delete sale.");
              Alert.alert("Success", "Sale deleted successfully");
              router.back();
            } catch (error) {
              Alert.alert("Error", (error as Error).message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDayPress = (day) => {
    const selectedDate = new Date(day.dateString);

    if (!sale.dates || sale.dates.length === 0) {
      setSale({ ...sale, dates: [day.dateString] });
    } else if (sale.dates.length === 1) {
      const startDate = new Date(sale.dates[0]);

      if (selectedDate >= startDate) {
        const updatedDates = getDatesInRange(sale.dates[0], day.dateString);
        setSale({ ...sale, dates: updatedDates });
        updateSaleDates(updatedDates);
      } else {
        setSale({ ...sale, dates: [day.dateString] });
      }
    } else {
      const startDate = new Date(sale.dates[0]);
      const endDate = new Date(sale.dates[sale.dates.length - 1]);

      if (selectedDate < startDate) {
        setSale({ ...sale, dates: [day.dateString] });
      } else if (selectedDate > endDate) {
        const updatedDates = getDatesInRange(sale.dates[0], day.dateString);
        setSale({ ...sale, dates: updatedDates });
        updateSaleDates(updatedDates);
      } else {
        setSale({ ...sale, dates: [day.dateString] });
      }
    }
  };

  const updateSaleDates = (updatedDates) => {
    setSale((prevSale) => ({
      ...prevSale,
      dates: updatedDates,
    }));
  };

  const getDatesInRange = (start, end) => {
    const dates = [];
    let currentDate = new Date(start);
    const lastDate = new Date(end);

    while (currentDate <= lastDate) {
      const dateString = currentDate.toISOString().split("T")[0];
      dates.push(dateString);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const startDate = sale?.dates?.[0];
  const endDate = sale?.dates?.[sale.dates.length - 1];

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      const selectedDate = new Date(selectedTime);
      if (currentPicker === "start") {
        setStartTime(selectedDate);
        setSale((prevSale) => ({
          ...prevSale,
          startTime: formatTime(selectedDate),
        }));
      } else if (currentPicker === "end") {
        if (selectedDate > startTime) {
          setEndTime(selectedDate);
          setSale((prevSale) => ({
            ...prevSale,
            endTime: formatTime(selectedDate),
          }));
        } else {
          Alert.alert("Invalid Time", "End time must be after start time.");
        }
      }
    }
    setCurrentPicker(null); // Close the modal after selecting time
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const toggleCategory = (category) => {
    setSale((prevSale) => {
      if (!prevSale) return null; // Handle the case when sale is null

      const updatedCategories = new Set(prevSale.categories || []);
      if (updatedCategories.has(category)) {
        updatedCategories.delete(category);
      } else {
        updatedCategories.add(category);
      }

      return {
        ...prevSale,
        categories: Array.from(updatedCategories),
      };
    });
  };

  const removeCategory = (category) => {
    setSale((prevSale) => {
      if (!prevSale) return null; // Handle the case when sale is null

      const updatedCategories = new Set(prevSale.categories || []);
      updatedCategories.delete(category);

      return {
        ...prevSale,
        categories: Array.from(updatedCategories),
      };
    });
  };

  const [temporarySelectedCategories, setTemporarySelectedCategories] =
    useState(new Set(sale?.categories || []));

  // Function to toggle category selection in the temporary state
  const toggleTemporaryCategory = (category) => {
    setTemporarySelectedCategories((prev) => {
      const updatedSet = new Set(prev);
      if (updatedSet.has(category)) {
        updatedSet.delete(category);
      } else {
        updatedSet.add(category);
      }
      return updatedSet;
    });
  };

  const applyTemporaryCategories = () => {
    setSale((prevSale) => {
      if (!prevSale) return null;

      return {
        ...prevSale,
        categories: Array.from(temporarySelectedCategories),
      };
    });
  };

  //   const handleChangePhoto = async (oldImageUri) => {
  //     Alert.alert(
  //       "Replace Photo",
  //       "Do you want to replace the your photo with a new picture?",
  //       [
  //         {
  //           text: "Cancel",
  //           style: "cancel",
  //         },
  //         {
  //           text: "Replace",
  //           onPress: async () => {
  //             await handleDeletePhoto(oldImageUri);
  //             openImagePicker();
  //             await handleAddPhoto();
  //           },
  //         },
  //       ],
  //       { cancelable: false }
  //     );
  //   };

  const handleDeletePhoto = async (imageUri) => {
    // console.log("Deleting photo with URI:", imageUri);
    try {
      setLoading(true);
      const response = await fetch(
        `https://yardhopperapi.onrender.com/api/listings/${id}/images?uri=${encodeURIComponent(
          imageUri
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          // body: JSON.stringify({uri: imageUri}),
        }
      );
      const responseBody = await response.json();
      console.log("API Response:", response.status, responseBody);
      if (!response.ok)
        throw new Error(responseBody.message || "Failed to delete photo");
      const updatedImages = responseBody;

      setSale((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          images: updatedImages,
        };
      });

      Alert.alert("Success", "Photo deleted successfully!");
    } catch (error) {
      Alert.alert(
        "Error in handling delete photoooo",
        (error as Error).message || "Failed to delete photo."
      );
    } finally {
      await fetchSale();
      setLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    try {
      if (!image) {
        Alert.alert("No image selected", "Please select an image to add.");
        return;
      }

      const fileInfo = await FileSystem.getInfoAsync(image);
      if (!fileInfo.exists) throw new Error("Selected file does not exist");

      const formData = new FormData();
      const imageName = image.split("/").pop() || "default-name.jpg";

      formData.append("image", {
        uri: image,
        type: mimeType,
        name: imageName,
      });
      const response = await fetch(
        `https://yardhopperapi.onrender.com/api/listings/${id}/images`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload image");
      const updatedImages = await response.json();

      await fetchSale();
      // setSale((prev) => {
      //   if (!prev) return null;

      //   return {
      //     ...prev,
      //     images: updatedImages,
      //   };
      // });

      Alert.alert("Success", "Photo added successfully!");
      reset();
    } catch (error) {
      Alert.alert("Error", (error as Error).message || "Failed to add photo.");
    }
  };

  const handlePageExit = () => {
    Alert.alert(
      "Unsaved Changes",
      "Are you sure you want to exit? Your changes won't be saved!",
      [
        {
          text: "Discard changes",
          onPress: () => {
            handleExitConfirmed();
          },
        },
        {
          text: "Stay on Page"
        },
      ],
      { cancelable: false }
    );
  };

  const handleExitConfirmed = () => {
    setSale(null);
    fetchSale();
    router.push({
      pathname: "../mylistings",
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!sale) {
    return (
      <View style={styles.container}>
        <Text>Failed to load sale details.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePageExit} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Listing</Text>
      </View>

      {/* Sale Details */}

      {/* Images */}
      <View style={styles.cardContainer}>
        {sale && sale.images && sale.images.length > 0 ? (
          sale.images.map((img, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{
                  uri: sale.images[index].uri || image, // Use the image from the sale data or from the picker preview
                }}
                style={styles.image}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => handleDeletePhoto(sale.images[index].uri)} // You can handle deletion here
              >
                <Text style={styles.buttonText}>Delete Photo</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
              style={styles.imageButton}
              onPress={() => handleChangePhoto(sale.images[index].uri)}// Opens the image picker to select a new photo
            >
              <Text style={styles.buttonText}>Select New Photo</Text>
            </TouchableOpacity> */}
            </View>
          ))
        ) : image ? (
          // If there's no image in the sale but one is selected from the picker
          <View style={styles.imagePlaceholderContainer}>
            <Image
              source={{
                uri: image,
              }}
              style={styles.placeholderImage}
              resizeMode="cover"
            />
            {/* <Text style={styles.noImagesText}>Photo isn't uploaded until you press `Upload Photo`</Text> */}
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleAddPhoto}
            >
              <Text style={styles.buttonText}>
                Add Selected Photo to Listing
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // If there's no image and no preview from the picker
          <View style={styles.imagePlaceholderContainer}>
            {/* <Image
              source={{
                uri: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png", // Placeholder image
              }}
              style={styles.placeholderImage}
              resizeMode="cover"
            /> */}
            {/* <Text style={styles.buttonText}>Add Photo</Text> */}
            <Text style={styles.noImagesText}>No images available for this listing.</Text>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={openImagePicker}
            >
              <Text style={styles.buttonText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Description */}
        <Text style={styles.inputLabel}>Update Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={sale.description}
          onChangeText={(text) => handleInputChange("description", text)}
          placeholder="Sale Description"
          multiline
        />

        {/* Address */}
        <TextInput
          style={styles.input}
          value={sale?.address?.street || ""}
          onChangeText={(text) => handleInputChange("address.street", text)}
          placeholder="Street"
        />
        <TextInput
          style={styles.input}
          value={sale?.address?.city || ""}
          onChangeText={(text) => handleInputChange("address.city", text)}
          placeholder="City"
        />
        <TextInput
          style={styles.input}
          value={sale?.address?.state || ""}
          onChangeText={(text) => handleInputChange("address.state", text)}
          placeholder="State"
        />
        <TextInput
          style={styles.input}
          value={sale?.address?.zip || ""}
          onChangeText={(text) => handleInputChange("address.zip", text)}
          placeholder="ZIP Code"
        />

        {/* Calendar */}
        <View style={styles.card}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              ...(startDate && endDate
                ? getDatesInRange(startDate, endDate).reduce((acc, date) => {
                    acc[date] = {
                      selected: true,
                      color: "#159636",
                      textColor: "white",
                    };
                    return acc;
                  }, {})
                : {}),
              ...(startDate && {
                [startDate]: {
                  selected: true,
                  startingDay: true,
                  color: "#159636",
                  textColor: "white",
                },
              }),
              ...(endDate && {
                [endDate]: {
                  selected: true,
                  endingDay: true,
                  color: "#159636",
                  textColor: "white",
                },
              }),
            }}
            markingType="period"
            theme={{
              arrowColor: "#159636",
              textMonthFontWeight: "semibold",
              todayTextColor: "#159636",
            }}
          />
        </View>

        {/* Time Picker */}
        <View style={styles.timePickerWrapper}>
          <View style={styles.timePickerRow}>
            {/* Start Time */}
            <View style={styles.timePickerContainer}>
              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setCurrentPicker("start")}
              >
                <Text>{sale.startTime}</Text>
              </TouchableOpacity>
            </View>

            {/* End Time */}
            <View style={styles.timePickerContainer}>
              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setCurrentPicker("end")}
              >
                <Text>{sale.endTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Picker Modal */}
          <Modal
            visible={currentPicker !== null}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setCurrentPicker(null)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {currentPicker === "start"
                    ? "Select Start Time"
                    : "Select End Time"}
                </Text>
                <DateTimePicker
                  value={currentPicker === "start" ? startTime : endTime}
                  mode="time"
                  is24Hour={true}
                  display="spinner"
                  onChange={handleTimeChange}
                />
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setCurrentPicker(null)}
                >
                  <Text style={styles.closeModalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>

          <View style={styles.selectedCategories}>
            {Array.from(sale.categories || []).map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.categoryChip}
                onPress={() => removeCategory(category)}
              >
                <Text style={styles.categoryChipText}>{category}</Text>
                <Ionicons name="close-circle" size={16} color="#FFF" />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => setShowAddCategory(true)}
          >
            <Text style={styles.addCategoryButtonText}>Add Category</Text>
          </TouchableOpacity>
        </View>

        {/* Update and Delete Buttons */}
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdateSale}
        >
          <Text style={styles.buttonText}>Update Sale</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteSale}
        >
          <Text style={styles.buttonText}>Delete Sale</Text>
        </TouchableOpacity>
      </View>

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategory}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddCategory(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Categories</Text>
            <ScrollView style={styles.categoryList}>
              {allCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryItem,
                    temporarySelectedCategories.has(category) &&
                      styles.modalCategoryItemSelected,
                  ]}
                  onPress={() => toggleTemporaryCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryItemText,
                      temporarySelectedCategories.has(category) &&
                        styles.modalCategoryTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                // Update the sale state with the selected categories
                setSale((prevSale) => {
                  if (!prevSale) return null; // Handle null case
                  return {
                    ...prevSale,
                    categories: Array.from(temporarySelectedCategories), // Update categories
                  };
                });
                setShowAddCategory(false); // Close the modal
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={{ height: 70 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingVertical: 12,
    backgroundColor: "#F8F8F8",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "500",
    color: "#159636",
    flex: 1,
    marginLeft: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    margin: 16,
    padding: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  imageButton: {
    backgroundColor: "#159636",
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
    width: "80%",
    alignSelf: "center",
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  imagePreview: {
    width: 300,
    height: 200,
    marginBottom: 40,
    borderRadius: 10,
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    borderColor: "#d9d9d9",
    borderWidth: 1,
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 28,
  },
  timePickerWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  timePickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  timePickerContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  placeholderImage: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 10,
  },
  imagePlaceholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  noImagesText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#159636",
  },
  categoriesContainer: {
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#159636",
    marginBottom: 8,
  },
  selectedCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#159636",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipText: {
    color: "#FFFFFF",
    marginRight: 4,
  },
  addCategoryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#159636",
    borderRadius: 25,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addCategoryButtonText: {
    color: "#159636",
    fontWeight: "bold",
  },
  updateButton: {
    backgroundColor: "#159636",
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 16,
    marginTop: 24,
    width: "50%",
    alignSelf: "center",
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    width: "50%",
    alignSelf: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#159636",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#159636",
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  closeModalButton: {
    backgroundColor: "#159636",
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
    width: "50%",
    alignSelf: "center",
  },
  closeModalButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalCategoryItemSelected: {
    backgroundColor: "#159636", // Green background
    borderRadius: 8,
  },
  modalCategoryTextSelected: {
    color: "#FFFFFF",
  },
  confirmButton: {
    backgroundColor: "#159636",
    padding: 8,
    borderRadius: 20,
    justifyContent: "center",
    marginTop: 10,
    width: "80%",
    marginLeft: "auto",
    marginRight: "auto",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    borderRadius: 20,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#CCCCCC",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#000000",
    fontWeight: "bold",
  },
  inlinePicker: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    elevation: 4, // For shadow on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4, // For shadow on iOS
  },
  timeButton: {
    padding: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    alignItems: "center",
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
});
